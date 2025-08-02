import { writeFile } from "fs/promises";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file: File | null = formData.get("file") as unknown as File;
    const clientId: string | null = formData.get("clientId") as string;

    if (!file || !clientId) {
      return NextResponse.json(
        { error: "File or clientId missing" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const filePath = path.join(uploadsDir, file.name);
    await writeFile(filePath, buffer);

    // Save clientId metadata
    const metadataDir = path.join(process.cwd(), "public", "metadata");
    if (!fs.existsSync(metadataDir)) fs.mkdirSync(metadataDir);

    const metadata = {
      fileName: file.name,
      clientId: clientId,
      uploadedAt: new Date().toISOString(),
    };

    const metadataPath = path.join(metadataDir, `${file.name}.json`);
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({ success: true, fileName: file.name });
  } catch (err) {
    console.error("Upload Error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
