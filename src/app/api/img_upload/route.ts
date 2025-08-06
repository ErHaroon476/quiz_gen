import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir,  } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { randomUUID } from 'crypto';

// POST /api/upload_img
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;

    if (!file || !clientId) {
      return NextResponse.json({ error: 'Missing file or clientId' }, { status: 400 });
    }

    // Prepare file paths
    const uploadDir = path.join(process.cwd(), 'public/uploads_img');
    const metaDir = path.join(process.cwd(), 'public/metadata_img');

    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });
    if (!existsSync(metaDir)) await mkdir(metaDir, { recursive: true });

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${randomUUID()}.${ext}`;
    const uploadPath = path.join(uploadDir, filename);

    // Save the image
    await writeFile(uploadPath, fileBuffer);

    // Create metadata
    const metadata = {
      originalName: file.name,
      savedName: filename,
      type: file.type,
      size: file.size,
      clientId,
      uploadedAt: new Date().toISOString(),
    };

    const metadataPath = path.join(metaDir, `${filename}.json`);
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({ message: 'Upload successful', filename, metadata }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
////