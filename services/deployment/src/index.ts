import "dotenv/config"
import s3Client from "../../../packages/common/aws-s3.js"


(async () => console.log(await s3Client.listBuckets()))()