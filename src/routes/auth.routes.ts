import express, { Request, Response } from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Cadastro
interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  message?: string;
  error?: string;
}

router.post(
  "/register",
  async (
    req: Request<unknown, unknown, RegisterRequestBody>,
    res: Response<RegisterResponse>
  ) => {
    const { username, email, password } = req.body;

    try {
      const userExists = await User.findOne({ email });

      if (userExists)
        return res.status(400).json({ error: "Email já cadastrado." });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();
      res.status(201).send({ message: "Usuário criado com sucesso!" });
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

      if (!user)
        return res.status(400).send({ message: "Email não cadastrado." });

      const match = await bcrypt.compare(password, user.password);

      if (!match) return res.status(400).send({ message: "Senha incorreta." });

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables.");
      }
      const token = jwt.sign(
        { id: user._id, name: user.username, email: user.email },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1d",
        }
      );

      res.status(200).json({ token });
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }
);

export default router;
