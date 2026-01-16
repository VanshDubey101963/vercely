import upload from "./upload.js";
import express, {Request, Response} from "express"

const app = express()
app.use(express.json())
  
app.post("/deploy", async (req: Request, res: Response) => {
  const url: string  = req.body?.url
  
  if (!url) {
    res.status(400).json({
      msg: "Url Required"
    })
  }
  
  try {
    await upload(url)
  } catch (err) {
    res.status(500).json({
      msg: err
    })
  }
  
  res.status(200).json({
    msg: "successfully uploaded!"
  })
})
  
app.listen(3001)
