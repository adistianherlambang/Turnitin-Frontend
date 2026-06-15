import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import r2Client, { R2_BUCKET, R2_PUBLIC_URL, ALLOWED_FOLDERS } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    if (!type || !ALLOWED_FOLDERS.includes(type as any)) {
      return NextResponse.json(
        { error: "Tipe upload tidak valid. Harus: payments, documents, atau results" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file melebihi batas 10MB" }, { status: 400 });
    }

    // Build R2 object key: {type}/turnitin_{timestamp}_{sanitized_name}
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `${type}/turnitin_${Date.now()}_${sanitizedName}`;

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
        ContentLength: file.size,
      })
    );

    // Build public URL
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      key,
      size: file.size,
      filename: `turnitin_${Date.now()}_${sanitizedName}`,
    });
  } catch (err: any) {
    console.error("[R2 Upload Error]", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengunggah file ke storage" },
      { status: 500 }
    );
  }
}
