import "dotenv/config";
import { randomUUID } from "crypto";
import { SimpleGit, simpleGit } from "simple-git";
import fs from "fs/promises";
import redisClient from "../../../packages/common/redis-broker.js";
import { uploadFolderToS3 } from "../../../packages/common/aws-utils.js";

async function upload(url: string): Promise<string> {
  // step 1 Get ID and set status to pending
  const id: string = randomUUID().toString();
  await redisClient.hSet("status", id, "pending-upload");

  //step 2 clone repo
  const gitClient: SimpleGit = simpleGit();
  await gitClient.clone(url, `temp/${id}`);

  //step 3 upload to s3 test bucket
  await uploadFolderToS3("test", `temp/${id}`, id);

  await redisClient.hSet("status", id, "uploaded");

  //step 4 delete the temp folder after uploading to s3
  await fs.rm("temp", { recursive: true });

  return id;
}

export default upload;
