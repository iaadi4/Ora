import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createWriteStream, unlinkSync } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import { readFileSync } from "fs";

const s3 = new S3Client({ region: process.env.BUCKET_REGION });
const HF_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v2";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY!;

const streamPipeline = promisify(pipeline);

function parseS3Url(url: string) {
  const match = url.match(
    /^https?:\/\/([^\.]+)\.s3[.-]([a-z0-9-]+)\.amazonaws\.com\/(.+)$/
  );
  if (!match) throw new Error("Invalid S3 URL");
  return {
    bucket: match[1],
    region: match[2],
    key: decodeURIComponent(match[3]),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const s3Url = searchParams.get("s3Url");

  if (!s3Url) {
    return NextResponse.json({ error: "Missing s3Url param" }, { status: 400 });
  }

  try {
    const { bucket, key } = parseS3Url(s3Url);
    const tempFilePath = `/tmp/${uuidv4()}.mp3`;

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(command);
    await streamPipeline(
      response.Body as NodeJS.ReadableStream,
      createWriteStream(tempFilePath)
    );

    const fileBuffer = readFileSync(tempFilePath);

    const hfResponse = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "audio/mpeg",
      },
      body: Buffer.from(fileBuffer),
    });

    unlinkSync(tempFilePath);

    if (!hfResponse.ok) {
      const text = await hfResponse.text(); // read raw text on error
      return NextResponse.json({ error: text }, { status: hfResponse.status });
    }

    const result = await hfResponse.json() as { text: string };
    return NextResponse.json({ text: result.text });
  } catch (err: unknown) {
    console.error("Error:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
