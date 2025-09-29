const jwt = require("jsonwebtoken");
import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(400).send({ message: "Acesso negado." });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload & { id: string };
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido." });
  }
};

export default authMiddleware;
