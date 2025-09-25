"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/transaction.routes.ts
const express_1 = __importDefault(require("express"));
const Product_1 = __importDefault(require("../models/Product"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const upload_1 = require("../middleware/upload");
const firebase_1 = require("../firebase");
const router = express_1.default.Router();
// -------------------------------
// Middleware de autenticação
// -------------------------------
router.use(authMiddleware_1.default);
// -------------------------------
// Rota: Buscar todos os produtos (JSON)
// -------------------------------
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
// -------------------------------
// Rota: Deletar produto
// -------------------------------
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Product_1.default.findOneAndDelete({
            _id: req.params.id,
            user: req.userId,
        });
        if (!deleted)
            return res.status(404).json({ error: "Produto não encontrado." });
        res.status(200).json({ message: "Produto deletado com sucesso." });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// -------------------------------
// Rota: Criar produto com imagem
// -------------------------------
// ⚠️ NÃO usar express.json() aqui, Multer processa o FormData
router.post("/", upload_1.upload.single("image"), async (req, res) => {
    try {
        const { title, description, amount, value } = req.body;
        // Pegar userId do middleware de autenticação
        const userId = req.userId;
        if (!userId)
            return res.status(401).json({ message: "Usuário não autenticado" });
        let imageUrl;
        if (req.file) {
            const fileName = `products/${Date.now()}-${req.file.originalname}`;
            const file = firebase_1.bucket.file(fileName);
            await file.save(req.file.buffer, {
                metadata: { contentType: req.file.mimetype },
            });
            await file.makePublic();
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
