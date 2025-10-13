import mongoose from "mongoose";
import { ragChat, redis, ingestPDFIfNeeded } from "../rag_ai/reader.js";
import { Redis } from "@upstash/redis";

const chatAI = async (req, res) => {
  ingestPDFIfNeeded();

  const { userId, question } = req.body;

  if (!question) {
    return res.status(400).json({
      message: "Question is required",
    });
  }

  const result = await ragChat({ userId, question });

  return res.status(200).json({
    message: "Successfully generated chat",
    data: result,
  });
};

export { chatAI };
