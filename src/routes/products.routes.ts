// src/routes/transaction.routes.ts
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Product, { IProduct } from "../models/Product";
import authMiddleware from "../middleware/authMiddleware";
import { upload } from "../middleware/upload";
import { bucket } from "../firebase";

const router = express.Router();

// -------------------------------
// Middleware de autenticação
// -------------------------------
router.use(authMiddleware);

// -------------------------------
// Tipagens
// -------------------------------
interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface ProductRequest extends Request {
  file?: Express.Multer.File;
  body: {
    title: string;
    description: string;
    amount: string;
    value: string;
  };
}

// -------------------------------
// Rota: Buscar todos os produtos por usuário
// -------------------------------
router.get(
  "/getAllProductsByUser",
  async (
    req: AuthenticatedRequest,
    res: Response<IProduct[] | { message: string }>
  ) => {
    try {
      const products = await Product.find({ user: req.userId });
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// -------------------------------
// Rota: Buscar todos os produtos
// -------------------------------
router.get(
  "/getAll",
  async (
    req: AuthenticatedRequest,
    res: Response<IProduct[] | { message: string }>
  ) => {
    try {
      const products = await Product.find({});
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

// -------------------------------
// Rota: Deletar produto
// -------------------------------
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
        return res.status(404).json({ error: "Produto não encontrado." });

      res.status(200).json({ message: "Produto deletado com sucesso." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// -------------------------------
// Rota: Criar produto com imagem
// -------------------------------
// ⚠️ NÃO usar express.json() aqui, Multer processa o FormData
router.post(
  "/",
  upload.single("image"),
  async (req: ProductRequest, res: Response) => {
    try {
      const { title, description, amount, value } = req.body;

      // Pegar userId do middleware de autenticação
      const userId = (req as any).userId;
      if (!userId)
        return res.status(401).json({ message: "Usuário não autenticado" });

      let imageUrl: string | undefined;

      if (req.file) {
        const fileName = `products/${Date.now()}-${req.file.originalname}`;
        const file = bucket.file(fileName);

        await file.save(req.file.buffer, {
          metadata: { contentType: req.file.mimetype },
        });

        await file.makePublic();
        imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      }

      const newProduct = new Product({
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
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;
