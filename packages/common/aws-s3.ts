import { S3 } from "@aws-sdk/client-s3";
const s3Client = new S3({
    endpoint: process.env.STORAGE_ENDPOINT,
});
export default s3Client;