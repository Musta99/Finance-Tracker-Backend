import express from "express";
import {
  createTransaction,
  fetchTransaction,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/", createTransaction);
router.get("/", fetchTransaction);

export default router;
