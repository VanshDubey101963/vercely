import "dotenv/config"
import { randomUUID } from "crypto";
import s3Client from "../../../packages/common/aws-s3.js";
import { SimpleGit, simpleGit } from "simple-git";
import fs from "fs/promises"
import { Dirent } from "fs";
import path from "path"

async function getFiles(
  dir: string,
  base = dir
): Promise<string[]> {
  
  var entries: Dirent<string>[] = await fs.readdir(dir, { withFileTypes: true, })
  var files: string[] = []
  
  for (const entry of entries) {
    const filePath: string = path.join(dir, entry.name)
    
    if (entry.isDirectory()) {
      files = files.concat(await getFiles(filePath, base))
    }
    else {
      files.push(path.relative(base, filePath))
    }
  }
  
  return files
  
}

function uploadFolderToS3(
  bucket: string,
  localDir: string,
  s3BaseFolder: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    getFiles(localDir)
      .then(files => {
        const uploadPromises = files.map(file => {
          const localPath = path.join(localDir, file);
          const s3Key = path.posix.join(s3BaseFolder, file);

          return fs.readFile(localPath)
            .then(body => {
              return s3Client.putObject({
                Bucket: bucket,
                Key: s3Key,
                Body: body
              })
            })
            .then(() => {
              console.log(`Uploaded → ${s3Key}`);
            });
        });
        return Promise.all(uploadPromises);
      })
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
}


async function upload(url: string): Promise<string> {
  // step 1 Get ID
  const id: string = randomUUID().toString()
  
  //step 2 clone repo
  const gitClient : SimpleGit = simpleGit()
  await gitClient.clone(url, `temp/${id}`)
  
  //step 3 upload to s3 test bucket
  await uploadFolderToS3('test', `temp/${id}`, id)
  
  //step 4 delete the temp folder after uploading to s3
  await fs.rm("temp", {recursive: true})
  
  return id
  
}

export default upload