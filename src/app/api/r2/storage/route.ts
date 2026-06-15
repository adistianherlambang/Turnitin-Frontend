import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import r2Client, { R2_BUCKET, R2_PUBLIC_URL, STORAGE_LIMIT_BYTES, ALLOWED_FOLDERS } from "@/lib/r2";

export const runtime = "nodejs";

export async function GET() {
  try {
    let totalSizeBytes = 0;
    const filesList: {
      name: string;
      key: string;
      folder: string;
      size: number;
      url: string;
      createdAt: string;
    }[] = [];

    // List objects for each folder
    for (const folder of ALLOWED_FOLDERS) {
      let continuationToken: string | undefined = undefined;

      do {
        const res = await r2Client.send(
          new ListObjectsV2Command({
            Bucket: R2_BUCKET,
            Prefix: `${folder}/`,
            ContinuationToken: continuationToken,
          })
        );

        for (const obj of res.Contents ?? []) {
          if (!obj.Key || !obj.Size) continue;
          totalSizeBytes += obj.Size;
          filesList.push({
            name: obj.Key.split("/").pop() ?? obj.Key,
            key: obj.Key,
            folder,
            size: obj.Size,
            url: `${R2_PUBLIC_URL}/${obj.Key}`,
            createdAt: obj.LastModified?.toISOString() ?? new Date().toISOString(),
          });
        }

        continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
      } while (continuationToken);
    }

    // Sort newest first
    filesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalSizeMB = Number((totalSizeBytes / (1024 * 1024)).toFixed(2));
    const limitMB = Math.round(STORAGE_LIMIT_BYTES / (1024 * 1024));
    const isFull = totalSizeBytes >= STORAGE_LIMIT_BYTES;

    return NextResponse.json({
      success: true,
      storage: {
        totalSize: totalSizeBytes,
        totalSizeMB,
        limit: STORAGE_LIMIT_BYTES,
        limitMB,
        isFull,
        files: filesList,
      },
    });
  } catch (err: any) {
    console.error("[R2 Storage Error]", err);
    return NextResponse.json({ error: err.message || "Gagal membaca storage" }, { status: 500 });
  }
}
