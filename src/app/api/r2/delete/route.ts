import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import r2Client, { R2_BUCKET, R2_PUBLIC_URL, STORAGE_LIMIT_BYTES, ALLOWED_FOLDERS } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Accept either `keys` (R2 object keys) or `urls` (public URLs to extract keys from)
    let keys: string[] = [];

    if (body.keys && Array.isArray(body.keys)) {
      keys = body.keys;
    } else if (body.urls && Array.isArray(body.urls)) {
      // Extract key from public URL: https://pub-xxx.r2.dev/{key}
      keys = body.urls.map((url: string) => {
        try {
          const urlObj = new URL(url);
          // Remove leading slash
          return urlObj.pathname.slice(1);
        } catch {
          return null;
        }
      }).filter(Boolean);
    }

    if (keys.length === 0) {
      return NextResponse.json(
        { error: "Array 'keys' atau 'urls' diperlukan" },
        { status: 400 }
      );
    }

    // Delete objects from R2 in batches of 1000 (S3 API limit)
    const deleted: string[] = [];
    const errors: { key: string; error: string }[] = [];

    const BATCH_SIZE = 1000;
    for (let i = 0; i < keys.length; i += BATCH_SIZE) {
      const batch = keys.slice(i, i + BATCH_SIZE);
      const result = await r2Client.send(
        new DeleteObjectsCommand({
          Bucket: R2_BUCKET,
          Delete: {
            Objects: batch.map((key) => ({ Key: key })),
            Quiet: false,
          },
        })
      );

      for (const d of result.Deleted ?? []) {
        if (d.Key) deleted.push(d.Key);
      }
      for (const e of result.Errors ?? []) {
        if (e.Key) errors.push({ key: e.Key, error: e.Message ?? "Unknown error" });
      }
    }

    // Re-fetch storage info for updated counts
    let totalSizeBytes = 0;
    const filesList: any[] = [];

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

    filesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const totalSizeMB = Number((totalSizeBytes / (1024 * 1024)).toFixed(2));
    const limitMB = Math.round(STORAGE_LIMIT_BYTES / (1024 * 1024));

    return NextResponse.json({
      success: true,
      deleted,
      errors,
      storage: {
        totalSize: totalSizeBytes,
        totalSizeMB,
        limit: STORAGE_LIMIT_BYTES,
        limitMB,
        isFull: totalSizeBytes >= STORAGE_LIMIT_BYTES,
        files: filesList,
      },
    });
  } catch (err: any) {
    console.error("[R2 Delete Error]", err);
    return NextResponse.json({ error: err.message || "Gagal menghapus file" }, { status: 500 });
  }
}
