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
// Rota: Buscar produto por id
// -------------------------------
router.get("/getProductById/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product_1.default.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Produto não encontrado." });
        }
        if (product.user.toString() !== req.userId) {
            return res.status(403).json({ message: "Acesso negado" });
        }
        res.status(200).json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// -------------------------------
// Rota: Buscar todos os produtos por usuário
// -------------------------------
router.get("/getAllProductsByUser", async (req, res) => {
    try {
        const products = await Product_1.default.find({ user: req.userId });
        res.status(200).json(products);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// -------------------------------
// Rota: Buscar todos os produtos
// -------------------------------
router.get("/getAll", async (req, res) => {
    try {
        const products = await Product_1.default.find({});
        res.status(200).json(products);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// -------------------------------
// Rota: Deletar produto
// -------------------------------
router.delete("/deleteProduct/:id", async (req, res) => {
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
router.post("/createProduct", upload_1.upload.single("image"), async (req, res) => {
    try {
        const { title, description, amount, value } = req.body;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        // -------------------------------
        // Verificações de consistência
        // -------------------------------
        if (!title || !description || !amount || !value) {
            return res.status(400).json({
                message: "Todos os campos obrigatórios devem ser preenchidos.",
            });
        }
        if (isNaN(Number(amount)) || Number(amount) < 0) {
            return res.status(400).json({ message: "Quantidade inválida." });
        }
        if (isNaN(Number(value)) || Number(value) < 0) {
            return res.status(400).json({ message: "Valor inválido." });
        }
        // Evitar produtos duplicados do mesmo usuário com o mesmo título
        const productExists = await Product_1.default.findOne({ title, user: userId });
        if (productExists) {
            return res
                .status(400)
                .json({ message: "Você já possui um produto com este título." });
        }
        // -------------------------------
        // Upload de imagem (se enviada)
        // -------------------------------
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
        // -------------------------------
        // Criar produto
        // -------------------------------
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
// -------------------------------
// Rota: Atualizar produto
// -------------------------------
router.put("/updateProduct/:id", upload_1.upload.single("image"), async (req, res) => {
    try {
        const { title, description, amount, value } = req.body;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }
        const product = await Product_1.default.findOne({
            _id: req.params.id,
            user: userId,
        });
        if (!product) {
            return res.status(404).json({ message: "Produto não encontrado." });
        }
        // -------------------------------
        // Verificações de consistência
        // -------------------------------
        if (amount && (isNaN(Number(amount)) || Number(amount) < 0)) {
            return res.status(400).json({ message: "Quantidade inválida." });
        }
        if (value && (isNaN(Number(value)) || Number(value) < 0)) {
            return res.status(400).json({ message: "Valor inválido." });
        }
        if (title) {
            const productExists = await Product_1.default.findOne({
                title,
                user: userId,
                _id: { $ne: req.params.id }, // ignora o produto atual
            });
            if (productExists) {
                return res
                    .status(400)
                    .json({ message: "Você já possui outro produto com este título." });
            }
        }
        // -------------------------------
        // Upload de imagem (se enviada)
        // -------------------------------
        let imageUrl = product.image;
        if (req.file) {
            const fileName = `products/${Date.now()}-${req.file.originalname}`;
            const file = firebase_1.bucket.file(fileName);
            await file.save(req.file.buffer, {
                metadata: { contentType: req.file.mimetype },
            });
            await file.makePublic();
            imageUrl = `https://storage.googleapis.com/${firebase_1.bucket.name}/${fileName}`;
        }
        // -------------------------------
        // Atualizar produto
        // -------------------------------
        product.title = title ?? product.title;
        product.description = description ?? product.description;
        product.amount = amount ? Number(amount) : product.amount;
        product.value = value ? Number(value) : product.value;
        product.image = imageUrl;
        await product.save();
        res.status(200).json({
            message: "Produto atualizado com sucesso!",
            product,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
