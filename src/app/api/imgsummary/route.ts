import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY_IMG!;
if (!OPENROUTER_API_KEY) throw new Error('Missing OpenRouter API key');

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: 'Missing fileName' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads_img', fileName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const mimeType = mime.lookup(filePath);
    if (!mimeType || !mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Unsupported or missing image type' }, { status: 400 });
    }

    // Optional: small delay to ensure file write completion
    await delay(300);

    const imageData = fs.readFileSync(filePath);
    const base64Image = `data:${mimeType};base64,${imageData.toString('base64')}`;

    const llm = new ChatOpenAI({
      temperature: 0,
      modelName: 'meta-llama/llama-3.2-11b-vision-instruct',
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'LuminAI',
        },
      },
      apiKey: OPENROUTER_API_KEY,
    });

    const messages = [
      new HumanMessage({
        content: [
          {
            type: 'text',
            text: 'Please describe the main content and key insights of this image in 2-3 lines.',
          },
          {
            type: 'image_url',
            image_url: { url: base64Image },
          },
        ],
      }),
    ];

    // 🔁 Retry loop up to 3 times
    let caption = '';
    const maxRetries = 15;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Attempt ${attempt} to get image summary...`);

      const response = await llm.call(messages);
      caption = typeof response.content === 'string' ? response.content.trim() : '';

      if (caption && !caption.toLowerCase().includes('no image')) {
        console.log(`✅ Valid caption received on attempt ${attempt}`);
        break;
      }

      if (attempt < maxRetries) {
        console.warn(`⚠️ Attempt ${attempt} failed. Retrying in 1s...`);
        await delay(1000); // 1 second wait before retry
      }
    }

    if (!caption || caption.toLowerCase().includes('no image')) {
      console.error('❌ Failed to get valid caption after 3 attempts');
      return NextResponse.json({ error: 'Caption was empty or invalid' }, { status: 500 });
    }

    console.log('✅ Final Image Summary:', caption);

    return NextResponse.json({
      success: true,
      caption,
    });
  } catch (error: any) {
    console.error('❌ Image Summary Error:', error.message || error);
    return NextResponse.json({ error: 'Image summary generation failed' }, { status: 500 });
  }
}
