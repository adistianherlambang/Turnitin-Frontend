import { S3Client } from "@aws-sdk/client-s3";

// Factory function — creates client fresh per request to ensure env vars are loaded
export function getR2Client() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 credentials missing. Please set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env.local"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function getR2Bucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) {
    throw new Error("R2_BUCKET_NAME is not set in environment variables");
  }
  return bucket;
}

export const R2_PUBLIC_URL = () =>
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

export const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB
export const ALLOWED_FOLDERS = ["payments", "documents", "results"] as const;
