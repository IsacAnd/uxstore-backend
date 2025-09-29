"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.post("/register", async (req, res) => {
    const { cpf, completeName, email, phone, password } = req.body;
    console.log(cpf, completeName, email, phone, password);
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
        if (await User_1.default.findOne({ email }))
            return res.status(400).json({ error: "Email já cadastrado." });
        if (await User_1.default.findOne({ cpf }))
            return res.status(400).json({ error: "CPF já cadastrado." });
        if (await User_1.default.findOne({ phone }))
            return res.status(400).json({ error: "Telefone já cadastrado." });
        // Criptografar senha e salvar
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = new User_1.default({
            cpf,
            completeName,
            phone,
            email,
            password: hashedPassword,
        });
        await newUser.save();
        // Gerar token
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, name: newUser.completeName, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(201).json({
            token,
            message: "Usuário registrado com sucesso.",
            user: {
                id: newUser._id.toString(),
                completeName: newUser.completeName,
                email: newUser.email,
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
        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email e senha são obrigatórios." });
        }
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
