import express from "express";
import dotenv, { config } from "dotenv";
import cors from "cors";
import pgclient from "./database.js";
import authRoutes from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(cors());

app.use(express.json());

app.use("/uploadsImages", express.static("uploadsImages"));


//http://localhost:3000/api/auth
app.use("/api/auth", authRoutes)

//http://localhost:3000/api/user
app.use("/api/user", userRouter)

//localhost:3000
app.get("/", (req,res)=> {
    res.send("API Server is ALive");
})
pgclient.connect().then(() => {
  app.listen(PORT, () => {
    console.log("SERVER IS UP");
  });
});

