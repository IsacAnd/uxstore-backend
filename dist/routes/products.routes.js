"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/transaction.routes.ts
const jwt = require("jsonwebtoken");
const express_1 = __importDefault(require("express"));
const Product_1 = __importDefault(require("../models/Product"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const upload_1 = require("../middleware/upload");
const firebase_1 = require("../firebase");
const router = express_1.default.Router();
// middleware para proteção de rotas
router.use(authMiddleware_1.default);
// Buscar todos os produtos
router.get("/", async (req, res) => {
    try {
        const products = await Product_1.default.find({ user: req.userId }).sort({
            transactionDate: -1,
        });
        res.status(200).json(products);
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
// Criar um produto
router.post("/", upload_1.upload.single("image"), async (req, res) => {
    try {
        const { title, description, amount, value } = req.body;
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token)
            return res.status(401).json({ message: "Token ausente" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        let imageUrl;
        if (req.file) {
            const fileName = `products/${Date.now()}-${req.file.originalname}`;
            const file = firebase_1.bucket.file(fileName);
            await file.save(req.file.buffer, {
                metadata: { contentType: req.file.mimetype },
            });
            await file.makePublic(); // deixa público
            imageUrl = `https://storage.googleapis.com/${firebase_1.bucket.name}/${fileName}`;
        }
        const newProduct = new Product_1.default({
            title,
            description,
            amount: Number(amount),
            value: Number(value),
            user: userId,
            image: imageUrl,
        });
        await newProduct.save();
        res
            .status(201)
            .json({ message: "Produto criado com sucesso!", product: newProduct });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.default = router;
