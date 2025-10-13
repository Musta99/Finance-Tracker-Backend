import express, { Router } from "express";
import { chatAI } from "../controllers/ragChatController.js";

const router = express.Router();

router.post("/ask", chatAI);

export default router;
