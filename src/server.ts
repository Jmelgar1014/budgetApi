import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
// import dotenv from "dotenv";
// dotenv.config();
import transactionRoutes from "./routes/transactions";

import { clerkMiddleware } from "@clerk/express";
import { useRateLimit } from "./rateLimit";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());
app.use("/api", useRateLimit);

app.use("/api/transactions", transactionRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Budget API Express with TypeScript" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  console.log(process.env.UPSTASH_REDIS_REST_TOKEN);
  console.log(process.env.UPSTASH_REDIS_REST_URL);
});
