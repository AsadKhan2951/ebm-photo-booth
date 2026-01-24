"use server";

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const STORAGE_DIR = path.join(process.cwd(), "storage", "prints");
const LOG_PATH = path.join(STORAGE_DIR, "log.jsonl");

function safeExt(mime) {
  const ext = mime.split("/")[1] || "png";
  if (ext === "jpeg") return "jpg";
  return ext.replace(/[^a-z0-9]/gi, "");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const imageData = body?.imageData;
    if (!imageData || typeof imageData !== "string") {
      return NextResponse.json({ error: "Missing image data." }, { status: 400 });
    }

    const match = imageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid image data format." }, { status: 400 });
    }

    const mime = match[1];
    const base64 = match[2].replace(/\s/g, "");
    const buffer = Buffer.from(base64, "base64");
    const ext = safeExt(mime) || "png";

    await fs.mkdir(STORAGE_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const rand = Math.random().toString(36).slice(2, 8);
    const filename = `${stamp}_${rand}.${ext}`;
    const filePath = path.join(STORAGE_DIR, filename);
    await fs.writeFile(filePath, buffer);

    const logEntry = {
      time: new Date().toISOString(),
      file: filename,
      size: buffer.length,
      action: body?.action || "print",
      characterId: body?.characterId || null,
      user: body?.user || null
    };
    await fs.appendFile(LOG_PATH, `${JSON.stringify(logEntry)}\n`);

    return NextResponse.json({ ok: true, file: filename });
  } catch (err) {
    console.error("Failed to save print image", err);
    return NextResponse.json({ error: "Failed to save image." }, { status: 500 });
  }
}
