import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  method: { type: String, default: "card" },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  description: { type: String, default: "" },
}, { timestamps: true });

export const Payment = mongoose.model("Payment", PaymentSchema);
