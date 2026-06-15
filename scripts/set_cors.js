const fs = require('fs');
const path = require('path');
const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3');

// Load environment variables directly from absolute path
const envPath = path.join(__dirname, '../.env.local');
if (!fs.existsSync(envPath)) {
  console.error(`.env.local not found at ${envPath}`);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const s3 = new S3Client({
  region: 'auto',
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const bucketName = env.R2_BUCKET_NAME;

const corsParams = {
  Bucket: bucketName,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedOrigins: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedHeaders: ['Content-Type', 'Content-Length', 'Authorization', 'X-Amz-Date', 'X-Amz-Security-Token'],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3600,
      },
    ],
  },
};

async function run() {
  try {
    console.log(`Setting CORS for bucket: ${bucketName}...`);
    await s3.send(new PutBucketCorsCommand(corsParams));
    console.log('CORS rules successfully applied!');
    
    console.log('Retrieving CORS configuration...');
    const result = await s3.send(new GetBucketCorsCommand({ Bucket: bucketName }));
    console.log('Current CORS Configuration:', JSON.stringify(result.CORSRules, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
