import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description?: string;
  value: number;
  amount: number;
  user: Types.ObjectId;
  image?: string;
}

const TransactionSchema = new Schema<IProduct>({
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
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  image: { type: String },
});

const Product = model<IProduct>("Product", TransactionSchema);

export default Product;
