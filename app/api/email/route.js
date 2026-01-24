import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const REQUIRED_ENV = ["SMTP_HOST", "SMTP_PORT", "SMTP_FROM"];

function getMissingEnv() {
  return REQUIRED_ENV.filter((key) => !process.env[key]);
}

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;
  return {
    mime: match[1],
    base64: match[2].replace(/\s/g, "")
  };
}

function safeExt(mime) {
  const ext = mime.split("/")[1] || "png";
  if (ext === "jpeg") return "jpg";
  return ext.replace(/[^a-z0-9]/gi, "");
}

export async function POST(req) {
  try {
    const missing = getMissingEnv();
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing email config: ${missing.join(", ")}` },
        { status: 500 }
      );
    }

    const body = await req.json();
    const to = body?.to;
    const imageData = body?.imageData;
    if (!to || typeof to !== "string") {
      return NextResponse.json({ error: "Missing recipient email." }, { status: 400 });
    }
    if (!imageData || typeof imageData !== "string") {
      return NextResponse.json({ error: "Missing image data." }, { status: 400 });
    }

    const parsed = parseDataUrl(imageData);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid image data format." }, { status: 400 });
    }

    const buffer = Buffer.from(parsed.base64, "base64");
    const ext = safeExt(parsed.mime) || "png";
    const filename = `photo-booth.${ext}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: body?.subject || "Your Photo Booth Print",
      text: body?.text || "Thanks for visiting! Your photo is attached.",
      attachments: [
        {
          filename,
          content: buffer,
          contentType: parsed.mime
        }
      ]
    });

    return NextResponse.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("Failed to send email", err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}
