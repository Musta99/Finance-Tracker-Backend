import express, { Router } from "express";
import {
  chatAI,
  fetchChat,
  ragChatStreaming,
} from "../controllers/ragChatController.js";

const router = express.Router();

router.post("/ask", chatAI);
router.get("/chat/:userId", fetchChat);
router.post("/stream-chat", ragChatStreaming);

export default router;
