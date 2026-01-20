import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import mime from "mime";
import s3Client from "../../../packages/common/aws-s3.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", async (req: Request, res: Response) => {
  // Get all the path parameters starting with the id
  try {
    const id = req.hostname.split(".")[0]
    
    const key = `${id}/dist/index.html`
  
    const contents = await s3Client.getObject({
      Bucket: "test",
      Key: key,
    });

    const contentType = mime.getType("index.html")
    res.setHeader("Content-Type", contentType);
    
    (contents.Body as NodeJS.ReadableStream).pipe(res)
    
  } catch (err) {
    console.log(err)
    
    if (err.name == "NoSuchKey") {
      return res.status(404).json({
        msg: "Not Found"
      })
    }
    
    res.status(500).json({
      msg: err
    })
  } 
});

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
    
    (contents.Body as NodeJS.ReadableStream).pipe(res)
    
  } catch (err) {
    if (err.name == "NoSuchKey") {
      return res.status(404).json({
        msg: "Not Found"
      })
    }
    
    console.log(err)
    
    res.status(500).json({
      msg: err
    })
  } 
});

app.listen(3002);
