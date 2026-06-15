import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getR2Bucket, R2_PUBLIC_URL, ALLOWED_FOLDERS } from "@/lib/r2";

export const runtime = "nodejs";

// Presign a PUT URL so the browser can upload directly to R2
// — avoids the Next.js body-size limit entirely
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, filename, contentType, size } = body as {
      type: string;
      filename: string;
      contentType: string;
      size: number;
    };

    if (!type || !ALLOWED_FOLDERS.includes(type as any)) {
      return NextResponse.json(
        { error: "Tipe upload tidak valid. Harus: payments, documents, atau results" },
        { status: 400 }
      );
    }

    if (!filename) {
      return NextResponse.json({ error: "Nama file diperlukan" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (size && size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file melebihi batas 10MB" }, { status: 400 });
    }

    const r2Client = getR2Client();
    const bucket = getR2Bucket();
    const publicUrl = R2_PUBLIC_URL();

    // Build R2 object key: {type}/turnitin_{timestamp}_{sanitized_name}
    const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${type}/turnitin_${Date.now()}_${sanitizedName}`;

    // Generate presigned PUT URL (valid for 15 minutes)
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType || "application/octet-stream",
    });

    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
    const filePublicUrl = `${publicUrl}/${key}`;

    return NextResponse.json({
      success: true,
      presignedUrl,
      key,
      publicUrl: filePublicUrl,
    });
  } catch (err: any) {
    console.error("[R2 Presign Error]", err);
    return NextResponse.json(
      { error: err.message || "Gagal membuat URL upload" },
      { status: 500 }
    );
  }
}
