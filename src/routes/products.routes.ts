// src/routes/transaction.routes.ts
import express, { Request, Response } from "express";
import Product, { IProduct } from "../models/Product";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// middleware para proteção de rotas
router.use(authMiddleware);

// Tipagem para requisição autenticada
interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Buscar todos os produtos
router.get(
  "/",
  async (
    req: AuthenticatedRequest,
    res: Response<IProduct[] | { message: string }>
  ) => {
    try {
      const products = await Product.find({ user: req.userId }).sort({
        transactionDate: -1,
      });
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Deletar uma transação por id
router.delete(
  "/:id",
  async (
    req: AuthenticatedRequest & { params: { id: string } },
    res: Response<{ message?: string; error?: string }>
  ) => {
    try {
      const deleted = await Product.findOneAndDelete({
        _id: req.params.id,
        user: req.userId,
      });

      if (!deleted)
        return res.status(404).json({ error: "Transação não encontrada." });

      res.status(200).json({ message: "Transação deletada com sucesso." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Criar um produto
router.post(
  "/",
  async (
    req: AuthenticatedRequest & { body: Omit<IProduct, "_id" | "user"> },
    res: Response<IProduct | { message: string }>
  ) => {
    try {
      const { title, description, amount, value } = req.body;

      const newProduct = new Product({
        title,
        description,
        amount,
        value,
        user: req.userId,
      });

      await newProduct.save();
      res.status(201).json({
        message: "Produto criado com sucesso!",
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;
