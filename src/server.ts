import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDatabase from "./config/db";
import cors from "cors";

import transactionRoutes from "./routes/products.routes";
import authRoutes from "./routes/auth.routes";
import { Request, Response } from "express";

const app = express();
const port = process.env.PORT;

connectDatabase();

app.use(cors());
app.use(express.json());
app.use("/api/products", transactionRoutes);
app.use("/api/auth", authRoutes);

interface ApiResponse {
  message: string;
}

app.get("/", (req: Request, res: Response<ApiResponse>) => {
  res.send({ message: "API UXStore funcionando!" });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`);
});
