"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User_1.default.findOne({ email });
        if (userExists)
            return res.status(400).json({ error: "Email já cadastrado." });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = new User_1.default({ username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).send({ message: "Usuário criado com sucesso!" });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user)
            return res.status(400).send({ message: "Email não cadastrado." });
        const match = await bcryptjs_1.default.compare(password, user.password);
        if (!match)
            return res.status(400).send({ message: "Senha incorreta." });
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined in environment variables.");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, name: user.username, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.status(200).json({ token });
    }
    catch (error) {
        res.status(400).send({ error: error.message });
    }
});
exports.default = router;
