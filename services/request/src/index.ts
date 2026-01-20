import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { S3, S3Client } from "@aws-sdk/client-s3";
import mime from "mime";

const s3Client = new S3({
  region: "us-east-1",
  endpoint: process.env.STORAGE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
  forcePathStyle: true,
});

const app = express();
app.use(express.json());
app.use(cors());

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}


app.get("/*params", async (req: Request, res: Response) => {
  // Get all the path parameters starting with the id
  try {
    var params: string | string[] = req.params.params;
    const id = req.hostname.split(".")[0]
  
    if (Array.isArray(params)) {
      params = params.join("/")
    }
  
    const key = `${id}/dist/${params}`
  
    const contents = await s3Client.getObject({
      Bucket: "test",
      Key: key,
    });

    const contentType = mime.getType(params.toString()) || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    (contents.Body as NodeJS.ReadableStream).pipe(res);

    if (contents.Body) {
      (contents.Body as NodeJS.ReadableStream).pipe(res);
    } else {
      res.status(404).send("File not found");
    }
  } catch (err) {
    res.status(500).json({
      msg: err
    })
  } 
});

app.listen(3002);
