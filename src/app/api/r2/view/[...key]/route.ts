import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, getR2Bucket } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> | { key: string[] } }
) {
  try {
    const r2Client = getR2Client();
    const bucket = getR2Bucket();

    // Await params for compatibility with newer Next.js versions (e.g. Next.js 15+)
    const resolvedParams = params instanceof Promise ? await params : params;
    
    if (!resolvedParams || !resolvedParams.key || resolvedParams.key.length === 0) {
      return NextResponse.json({ error: "Missing file key path" }, { status: 400 });
    }

    const key = resolvedParams.key.join("/");

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: "File empty or missing" }, { status: 404 });
    }

    // Convert response body stream to byte array/Buffer
    const byteArray = await response.Body.transformToByteArray();
    const buffer = Buffer.from(byteArray);

    const contentType = response.ContentType || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("[R2 View Error]", err);
    return NextResponse.json(
      { error: "File tidak ditemukan atau gagal dimuat" },
      { status: 404 }
    );
  }
}
