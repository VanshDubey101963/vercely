import redisClient from "../../../packages/common/redis-broker.js";
import enqueueJob from "../../../packages/common/redis-ops.js";
import upload from "./upload.js";
import express, { Request, Response } from "express";
import cors from 'cors'

const app = express();
app.use(express.json());
app.use(cors())

app.post("/deploy", async (req: Request, res: Response) => {
  const url: string = req.body?.url;

  if (!url) {
    return res.status(400).json({
      msg: "Url Required",
    });
  }

  try {
    const id: string = await upload(url);

    res.status(200).json({
      id: id,
      msg: "successfully uploaded!",
    });

    await enqueueJob(id);
  } catch (err) {
    res.status(500).json({
      msg: err,
    });
  }
});

app.get("/status/:id", async (req: Request, res: Response) => {
  try {
    const id: string | string[] = req.params.id;
    const statusString: string | {} = await redisClient.hGet(
      "status",
      id.toString(),
    );

    return res.status(200).json({
      status: statusString,
    });
  } catch (err) {
    res.status(500).json({
      msg: err,
    });
  }
});

app.listen(3001);
