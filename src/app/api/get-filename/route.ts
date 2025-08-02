import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { clientId } = await req.json();
    if (!clientId) {
      return NextResponse.json({ error: 'Missing clientId' }, { status: 400 });
    }

    const metadataDir = path.join(process.cwd(), 'public', 'metadata');
    const files = fs.readdirSync(metadataDir);

    const clientFiles = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const metadataPath = path.join(metadataDir, file);
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

        if (metadata.clientId === clientId && metadata.uploadedAt) {
          clientFiles.push(metadata);
        }
      }
    }

    if (clientFiles.length === 0) {
      return NextResponse.json({ error: 'No files found for this clientId' }, { status: 404 });
    }

    // Sort by uploadedAt descending (latest first)
    clientFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    const latestFile = clientFiles[0];
    console.log(`✅ Latest file for clientId ${clientId}: ${latestFile.fileName}`);

    return NextResponse.json({ fileName: latestFile.fileName });

  } catch (err) {
    console.error('❌ Failed to fetch filename:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
