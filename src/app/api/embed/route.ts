import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function POST(req: Request) {
  try {
    const { fileName, clientId } = await req.json();

    if (!fileName || !clientId) {
      return NextResponse.json({ error: "Missing fileName or clientId" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    console.log(`✅ Reading file: ${fileName}`);

    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    console.log(`📄 ${fileName} has been read successfully.`);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitDocuments(docs);
    console.log(`🧩 Total Chunks Created: ${chunks.length}`);

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY!,
      model: "sentence-transformers/all-MiniLM-L6-v2",
    });

    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    const namespace = `${clientId}_${fileName.replace(".pdf", "")}`;

    await PineconeStore.fromDocuments(chunks, embeddings, {
      pineconeIndex: index,
      namespace,
    });

    console.log(`✅ Embedding and upload to Pinecone successful for ${namespace}`);

    return NextResponse.json({
      message: `✅ File ${fileName} embedded and stored under ${namespace}.`,
    });
  } catch (error: any) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
}
