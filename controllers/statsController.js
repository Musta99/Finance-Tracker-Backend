import Transaction from "../models/transaction.js";
import mongoose from "mongoose";

const monthlyStats = async (req, res, next) => {
  try {
    const pipeLine = [
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },

      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "Expense"] }, "$amount", 0] },
          },
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "Income"] }, "$amount", 0] },
          },
        },
      },

      { $sort: { _id: 1 } },
    ];

    console.log(pipeLine);

    const result = await Transaction.aggregate(pipeLine);
    res.json({ monthly: result });
  } catch (err) {
    next(err);
  }
};

export { monthlyStats };
