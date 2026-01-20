import "dotenv/config";
import { execa } from "execa";
import fs from "fs/promises";
import fsync from "fs"
import {
  downloadS3Folder,
  uploadFolderToS3,
} from "../../../packages/common/aws-utils.js";
import redisClient from "../../../packages/common/redis-broker.js";

async function main() {
  while (true) {
    // Retrieve JobId from the redis queue
    try {
      
      const jobId = await redisClient.rPop("queue:deployapp");

      // Check if jobId exists
      if (!jobId) {
        continue;
      }

      // Download the folder from minio or s3 object storage
      await downloadS3Folder(jobId.toString());

      // Install npm packages and build the downloaded react project
      const cwd = `output/${jobId}`;
      await execa("npm", ["install"], { cwd });
      await execa("npm", ["run", "build"], { cwd });
      
      // Upload build (dist) folder to s3
      await uploadFolderToS3("test", `output/${jobId}/dist`, `${jobId}/dist`);
    
      // Change status to deployed
      await redisClient.hSet("status", jobId.toString(), "deployed");

      // Cleanup the output folder
      if (fsync.existsSync("output")) {  
        await fs.rm("output", { recursive: true });
      }
      
    } catch (err: unknown) {
      console.log(err)
      
      if (fsync.existsSync("output")) {  
        await fs.rm("output", { recursive: true });
      }
    }
  }  
}

main();
