import express from "express";
import {
  createTransaction,
  fetchTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/", createTransaction);
router.get("/", fetchTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
