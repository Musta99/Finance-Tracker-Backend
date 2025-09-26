import express from "express";
import {
  createTransaction,
  fetchTransaction,
  updateTransaction,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/", createTransaction);
router.get("/", fetchTransaction);
router.put("/:id", updateTransaction);

export default router;
