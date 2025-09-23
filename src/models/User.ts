// user.model.ts
import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  cpf: string;
  completeName: string;
  email: string;
  phone: string;
  password: string;
}

const userSchema = new mongoose.Schema<IUser>({
  cpf: { type: String, required: true },
  completeName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = model<IUser>("User", userSchema);

export default User;
