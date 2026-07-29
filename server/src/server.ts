import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Backend running");
});

app.listen(5000, () => {
  console.log("server running");
});
