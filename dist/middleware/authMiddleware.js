"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
        return res.status(400).send({ message: "Acesso negado." });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        res.status(401).json({ error: "Token inválido." });
    }
};
exports.default = authMiddleware;
