import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createWriteStream, readFileSync, unlinkSync } from "fs";
import { pipeline } from "stream/promises";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";
import { HttpStatus } from "@/lib/http-status";

const s3 = new S3Client({ region: process.env.BUCKET_REGION });

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

export async function POST(req: NextRequest) {
  const { s3Url } = await req.json();

  if (!s3Url) {
    return NextResponse.json({
      success: false,
      message: "Missing required fields",
      error:  {
        message: "Missing s3Url param"
      }
    },{
      status: HttpStatus.BAD_REQUEST
    });
  }

  try {
    const { bucket, key } = parseS3Url(s3Url);
    const tempFilePath = `/tmp/${uuidv4()}.mp3`;

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3.send(command);
    await pipeline(
      response.Body as NodeJS.ReadableStream,
      createWriteStream(tempFilePath)
    );

    const fileBuffer = readFileSync(tempFilePath);

    const formData = new FormData();
    formData.append("file", new File([fileBuffer], "audio.mp3", { type: "audio/mpeg" }));

    const fastApiResponse = await fetch("http://localhost:8000/transcribe", {
      method: "POST",
      body: formData,
    });

    unlinkSync(tempFilePath);

    if (!fastApiResponse.ok) {
      const text = await fastApiResponse.text();
      return NextResponse.json({
        success: false,
        message: "Failed to transcribe audio",
        error: text
      },{
        status: fastApiResponse.status
      });
    }

    const result = await fastApiResponse.json();
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Error:", err);
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: err || "Unknown error"
    },{
      status: HttpStatus.INTERNAL_SERVER_ERROR
    });
  }
}
