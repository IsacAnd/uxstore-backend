import express, { Request, Response } from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
// Cadastro
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
      const userExists = await User.findOne({ email });
      if (userExists)
        return res.status(400).json({ error: "Email já cadastrado." });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        cpf,
        completeName,
        phone,
        email,
        password: hashedPassword,
      });

      const user = await newUser.save();

      const token = jwt.sign(
        { id: user._id, name: user.completeName, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      res.status(201).json({
        token,
        message: "Usuário registrado com sucesso.",
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

// Login
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
