import dotenv from "dotenv";
dotenv.config();
import { createServer } from 'node:http'; 
import express from "express";
import cors from "cors";
import cron from "node-cron";
import { login } from './contollers/login.js';
import { connectToRedis } from './infrastructure/redis/RedisClient.js';
import { rateLimiter } from './middlewares/redis/rateLimiter.js';
import authRoutes from './routes/auth/login.js';


const app = express();
const port = 5000;

connectToRedis();
app.set("trust proxy", true);
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin:"*"
}))

app.get("/api", (req, res) => {
  res.status(200).json({
    msg: "Hello World From Node Server" ,
  })
});

app.use("/api", authRoutes)

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});
// Start the server and listen on the specified port
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});


