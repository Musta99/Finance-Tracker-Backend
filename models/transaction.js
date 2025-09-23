import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["Income", "Expense"], default: "Expense" },
  category: { type: String, default: "Uncategorized" },
  note: { type: String },
  date: { type: Date, default: Date.now },
  metadata: { type: Object },
});

export default mongoose.model("Transaction", TransactionSchema);
