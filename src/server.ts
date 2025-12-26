import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import transactionRoutes from "./routes/transactions";
import { clerkMiddleware } from "@clerk/express";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.use("/api/transactions", transactionRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Budget API Express with TypeScript" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
