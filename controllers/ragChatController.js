import mongoose from "mongoose";
import {
  ragChat,
  redis,
  ingestPDFIfNeeded,
  ragChatStream,
} from "../rag_ai/reader.js";

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

// retrieve chat
const fetchChat = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    const key = `chat:${userId}`;
    const messages = await redis.lrange(key, 0, 50);
    console.log(messages);
    return res.status(200).json({
      message: "Successfully fetched message",
      data: messages,
    });
  } catch (err) {
    return res.status(500).json({
      message: `${err}: something error occured`,
    });
  }
};

// RAG chat Streaming
const ragChatStreaming = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // const { userId, question } = req.body;

  const userId = "user420";
  const question = req.query.q;

  const stream = await ragChatStream({ userId, question });
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
  }

  res.write("data: [DONE]\n\n");
  res.end();
};

export { chatAI, fetchChat, ragChatStreaming };
