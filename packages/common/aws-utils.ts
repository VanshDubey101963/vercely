import { Dirent } from "fs";
import path from "path";
import s3Client from "./aws-s3.js";
import fs from "fs/promises";
import fssync from "fs";

async function getFiles(dir: string, base = dir): Promise<string[]> {
  var entries: Dirent<string>[] = await fs.readdir(dir, {
    withFileTypes: true,
  });
  var files: string[] = [];

  for (const entry of entries) {
    const filePath: string = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(await getFiles(filePath, base));
    } else {
      files.push(path.relative(base, filePath));
    }
  }

  return files;
}

export function uploadFolderToS3(
  bucket: string,
  localDir: string,
  s3BaseFolder: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    getFiles(localDir)
      .then((files) => {
        const uploadPromises = files.map((file) => {
          const localPath = path.join(localDir, file);
          const s3Key = path.posix.join(s3BaseFolder, file);

          return fs.readFile(localPath).then((body) => {
            return s3Client.putObject({
              Bucket: bucket,
              Key: s3Key,
              Body: body,
            });
          });
        });
        return Promise.all(uploadPromises);
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function downloadS3Folder(prefix: string) {
  const response = await s3Client.listObjectsV2({
    Bucket: "test",
    Prefix: prefix,
  });

  for (let content of response?.Contents) {
    const contentData = await s3Client.getObject({
      Bucket: "test",
      Key: content.Key,
    });

    fssync.mkdirSync(path.dirname(`output/${content.Key}`), {
      recursive: true,
    });
    const byteArray = await contentData.Body.transformToByteArray();
    const buffer = Buffer.from(byteArray);

    fssync.writeFileSync(`output/${content.Key}`, buffer);
  }
}
