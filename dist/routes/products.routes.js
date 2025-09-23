"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/transaction.routes.ts
const express_1 = __importDefault(require("express"));
const Product_1 = __importDefault(require("../models/Product"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = express_1.default.Router();
// middleware para proteção de rotas
router.use(authMiddleware_1.default);
// Buscar todas as transações
router.get("/", async (req, res) => {
    try {
        const transactions = await Product_1.default.find({ user: req.userId }).sort({
            transactionDate: -1,
        });
        res.status(200).json(transactions);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Deletar uma transação por id
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Product_1.default.findOneAndDelete({
            _id: req.params.id,
            user: req.userId,
        });
        if (!deleted)
            return res.status(404).json({ error: "Transação não encontrada." });
        res.status(200).json({ message: "Transação deletada com sucesso." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Criar uma transação
router.post("/", async (req, res) => {
    try {
        const { title, description, amount, transactionDate, type } = req.body;
        const newTransaction = new Product_1.default({
            title,
            description,
            amount,
            transactionDate,
            type,
            user: req.userId,
        });
        await newTransaction.save();
        res.status(201).json(newTransaction);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Calcular balance
router.get("/balance", async (req, res) => {
    try {
        const userTransactions = await Product_1.default.find({ user: req.userId });
        const balance = userTransactions.reduce((acc, transaction) => {
            if (transaction.type === "income")
                acc.income += transaction.amount;
            else if (transaction.type === "expense")
                acc.expense += transaction.amount;
            acc.total = acc.income - acc.expense;
            return acc;
        }, { income: 0, expense: 0, total: 0 });
        res.status(200).json(balance);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
