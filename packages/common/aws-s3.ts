import { S3, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3({
  region: "us-east-1",
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
  forcePathStyle: true,
});

export default s3Client;
