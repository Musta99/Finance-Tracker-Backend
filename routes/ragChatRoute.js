import express, { Router } from "express";
import { chatAI, fetchChat } from "../controllers/ragChatController.js";

const router = express.Router();

router.post("/ask", chatAI);
router.get("/chat/:userId", fetchChat);

export default router;
