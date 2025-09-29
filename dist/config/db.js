"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
function connectDatabase() {
    try {
        mongoose.connect(process.env.MONGODB_URI);
        console.log("Conexão ao banco estabelecida com sucesso!");
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        else {
            console.log(error);
        }
        process.exit(1);
    }
}
exports.default = connectDatabase;
