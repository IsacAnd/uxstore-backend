// src/routes/transaction.routes.ts
import express, { Request, Response } from "express";
import Transaction, { ITransaction } from "../models/Product";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// middleware para proteção de rotas
router.use(authMiddleware);

// Tipagem para requisição autenticada
interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Buscar todas as transações
router.get(
  "/",
  async (
    req: AuthenticatedRequest,
    res: Response<ITransaction[] | { message: string }>
  ) => {
    try {
      const transactions = await Transaction.find({ user: req.userId }).sort({
        transactionDate: -1,
      });
      res.status(200).json(transactions);
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
      const deleted = await Transaction.findOneAndDelete({
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

// Criar uma transação
router.post(
  "/",
  async (
    req: AuthenticatedRequest & { body: Omit<ITransaction, "_id" | "user"> },
    res: Response<ITransaction | { message: string }>
  ) => {
    try {
      const { title, description, amount, transactionDate, type } = req.body;

      const newTransaction = new Transaction({
        title,
        description,
        amount,
        transactionDate,
        type,
        user: req.userId,
      });

      await newTransaction.save();
      res.status(201).json(newTransaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Calcular balance
router.get(
  "/balance",
  async (
    req: AuthenticatedRequest,
    res: Response<
      { income: number; expense: number; total: number } | { message: string }
    >
  ) => {
    try {
      const userTransactions = await Transaction.find({ user: req.userId });

      const balance = userTransactions.reduce(
        (acc, transaction) => {
          if (transaction.type === "income") acc.income += transaction.amount;
          else if (transaction.type === "expense")
            acc.expense += transaction.amount;

          acc.total = acc.income - acc.expense;
          return acc;
        },
        { income: 0, expense: 0, total: 0 }
      );

      res.status(200).json(balance);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;
