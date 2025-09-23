import { Schema, model, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  title: string;
  description?: string;
  amount: number;
  type: "income" | "expense";
  registerDate: Date;
  transactionDate: Date;
  user: Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },
  registerDate: {
    type: Date,
    default: Date.now,
  },
  transactionDate: {
    type: Date,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Transaction = model<ITransaction>("TransactioN", TransactionSchema);

export default Transaction;
