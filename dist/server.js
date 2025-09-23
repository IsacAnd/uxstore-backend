"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const cors_1 = __importDefault(require("cors"));
const products_routes_1 = __importDefault(require("./routes/products.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const app = (0, express_1.default)();
const port = process.env.PORT;
(0, db_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
}));
app.use(express_1.default.json());
app.use("/api/products", products_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.get("/", (req, res) => {
    res.send({ message: "API UXStore funcionando!" });
});
app.listen(port, () => {
    console.log(`Servidor rodando na porta: ${port}`);
});
