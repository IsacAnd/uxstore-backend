"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TransactionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    value: {
        type: Number,
        required: false,
    },
    amount: {
        type: Number,
        required: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image: { type: String },
});
const Product = (0, mongoose_1.model)("Product", TransactionSchema);
exports.default = Product;
