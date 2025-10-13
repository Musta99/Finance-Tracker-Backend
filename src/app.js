import cors from "cors";
import express from "express";
import authRoutes from "../routes/authRoutes.js";
import transactionRoutes from "../routes/transactionRoutes.js";
import statsRoutes from "../routes/statsRoutes.js";
import userRoute from "../routes/userRoutes.js";
import ragRouter from "../routes/ragChatRoute.js";

const app = express();
app.use(cors());
app.use(express.json());

// mount routes
app.use("/api/routes", authRoutes);
app.use("/api/routes", transactionRoutes);
app.use("/api/statsroutes", statsRoutes);
app.use("/api/userinfo", userRoute);
app.use("/api/rag", ragRouter);

export default app;
