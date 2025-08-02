import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import fs from "fs/promises";
import path from "path";

// Truncate at sentence boundary
function truncateAtLastSentence(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf(".");
  return lastPeriod !== -1 ? truncated.slice(0, lastPeriod + 1) : truncated;
}

// Summarize using OpenRouter + DeepSeek
async function summarizeChunk(chunk: string, openRouterApiKey: string, type: string) {
  const systemPrompt = `
You are an expert document summarizer. Your task is to extract only the most meaningful and relevant content from the input text. Exclude headers, footers, metadata, and boilerplate instructions.

If the content is a story, summarize only the core lesson teached. Ignore excessive narrative details unless they are essential to understanding the story's message.

If the content includes a person's profile, resume, or biodata, include only the person's name, key qualifications, and skills. Do not include contact information or unrelated personal details.

If the content is a project or technical document, focus on summarizing the project's purpose, major features, goals, and key outcomes. Exclude metadata, disclaimers, or general background content.

Return a summary that is ${type === "detailed" ? "detailed and comprehensive" : "concise and focused"}.
`;

  const userPrompt = `Summarize this content:\n\n${chunk}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openRouterApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim();
}

export async function POST(req: Request) {
  try {
    const { clientId, fileName, type = "concise" } = await req.json();

    if (!clientId || !fileName) {
      return NextResponse.json({ error: "Missing clientId or fileName" }, { status: 400 });
    }

    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

    if (!hfApiKey || !openRouterApiKey || !pineconeApiKey || !pineconeIndexName) {
      return NextResponse.json({ error: "Missing environment configuration." }, { status: 500 });
    }

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: hfApiKey,
      model: "sentence-transformers/all-MiniLM-L6-v2",
    });

    const pinecone = new Pinecone({ apiKey: pineconeApiKey });
    const index = pinecone.Index(pineconeIndexName);
    const namespace = `${clientId}_${fileName.replace(".pdf", "")}`;

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace,
    });

    const query =
      "What is the key message in this document? Return chunks that explain the summary of the main content of the document.";
    const topK = 20;

    const results = await vectorStore.similaritySearch(query, topK);

    if (!results || results.length === 0) {
      return NextResponse.json(
        {
          success: false,
          warning: "No relevant chunks found. Make sure the document is embedded correctly.",
          metadata: {
            clientId,
            fileName,
            namespace,
            queryUsed: query,
          },
        },
        { status: 200 }
      );
    }

    const uniqueChunks = [...new Set(results.map((doc) => doc.pageContent.trim()))];

    const maxPerChunk = 1800;
    let chunkGroup: string[] = [];
    let buffer = "";

    for (const chunk of uniqueChunks) {
      if ((buffer + chunk).length > maxPerChunk) {
        chunkGroup.push(buffer.trim());
        buffer = chunk;
      } else {
        buffer += "\n\n" + chunk;
      }
    }
    if (buffer.trim()) chunkGroup.push(buffer.trim());

    const summaries: string[] = [];

    for (const group of chunkGroup) {
      const summary = await summarizeChunk(
        truncateAtLastSentence(group, maxPerChunk),
        openRouterApiKey,
        type
      );
      if (summary && summary.length > 50) {
        summaries.push(summary);
      }
    }

    const finalSummary = summaries.join(" ").trim();

    // 🧹 Delete Pinecone namespace
    await index.namespace(namespace).deleteAll();

    // Prepare response data first
    const responseData = {
      success: true,
      data: {
        summary: finalSummary,
        metadata: {
          clientId,
          fileName,
          namespace,
          chunksUsed: uniqueChunks.length,
          summarizedChunks: chunkGroup.length,
          model: "mistralai/mistral-7b-instruct",
          type,
          timestamp: new Date().toISOString(),
          pineconeNamespaceDeleted: true,
          filesDeleted: false, // Will update after deletion attempt
        },
      },
    };

    // 🧹 Delete files AFTER preparing response (to ensure metadata is available if needed)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const metadataDir = path.join(process.cwd(), "public", "metadata");
    const pdfPath = path.join(uploadsDir, fileName);
    const jsonPath = path.join(metadataDir, `${fileName}.json`);

    try {
      // First verify metadata exists and clientId matches
      const jsonData = JSON.parse(await fs.readFile(jsonPath, "utf-8"));
      if (jsonData.clientId === clientId) {
        await Promise.allSettled([
          fs.unlink(pdfPath).catch(() => {}),
          fs.unlink(jsonPath).catch(() => {})
        ]);
        responseData.data.metadata.filesDeleted = true;
      }
    } catch (err) {
      // Silently ignore if files don't exist or can't be read
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (err: any) {
    console.error("❌ summarize/route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Summary generation failed",
        details: err?.message,
        suggestion: "Make sure the document was embedded first, and try again.",
      },
      { status: 500 }
    );
  }
}