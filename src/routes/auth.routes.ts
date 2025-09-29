import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();

// -------------------------------
// Tipagens
// -------------------------------
interface RegisterRequestBody {
  cpf: string;
  completeName: string;
  phone: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  token?: string;
  message?: string;
  user?: {
    id: string;
    completeName: string;
    email: string;
  };
  error?: string;
}

router.post(
  "/register",
  async (
    req: Request<unknown, unknown, RegisterRequestBody>,
    res: Response<RegisterResponse>
  ) => {
    const { cpf, completeName, email, phone, password } = req.body;

    try {
      if (!cpf || !completeName || !email || !phone || !password) {
        return res
          .status(400)
          .json({ error: "Todos os campos são obrigatórios." });
      }

      if (!/^\d{11}$/.test(cpf)) {
        return res
          .status(400)
          .json({ error: "CPF inválido. Deve conter 11 dígitos numéricos." });
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: "E-mail inválido." });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "A senha deve ter pelo menos 6 caracteres." });
      }

      // Verificações de duplicidade
      if (await User.findOne({ email }))
        return res.status(400).json({ error: "Email já cadastrado." });

      if (await User.findOne({ cpf }))
        return res.status(400).json({ error: "CPF já cadastrado." });

      if (await User.findOne({ phone }))
        return res.status(400).json({ error: "Telefone já cadastrado." });

      // Criptografar senha e salvar
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        cpf,
        completeName,
        phone,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      // Gerar token
      const token = jwt.sign(
        { id: newUser._id, name: newUser.completeName, email: newUser.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      res.status(201).json({
        token,
        message: "Usuário registrado com sucesso.",
        user: {
          id: newUser._id.toString(),
          completeName: newUser.completeName,
          email: newUser.email,
        },
      });
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  }
);

// -------------------------------
// Login
// -------------------------------
interface LoginRequestBody {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  message?: string;
  user?: {
    id: string;
    completeName: string;
    email: string;
  };
  error?: string;
}

router.post(
  "/login",
  async (
    req: Request<unknown, unknown, LoginRequestBody>,
    res: Response<LoginResponse>
  ) => {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email e senha são obrigatórios." });
      }

      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Credenciais inválidas." });
      }

      const token = jwt.sign(
        { id: user._id, name: user.completeName, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        token,
        message: "Usuário logado com sucesso.",
        user: {
          id: user._id.toString(),
          completeName: user.completeName,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  }
);

export default router;
