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
    const { cpf, completeName, email, phone, password } = req.body;
    try {
        const userExists = await User_1.default.findOne({ email });
        if (userExists)
            return res.status(400).json({ error: "Email já cadastrado." });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = new User_1.default({
            cpf,
            completeName,
            phone,
            email,
            password: hashedPassword,
        });
        const user = await newUser.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, name: user.completeName, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(201).json({
            token,
            message: "Usuário registrado com sucesso.",
            user: {
                id: user._id.toString(),
                completeName: user.completeName,
                email: user.email,
            },
        });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, name: user.completeName, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({
            token,
            message: "Usuário logado com sucesso.",
            user: {
                id: user._id.toString(),
                completeName: user.completeName,
                email: user.email,
            },
        });
    }
    catch (error) {
        res.status(500).send({ error: error.message });
    }
});
exports.default = router;
