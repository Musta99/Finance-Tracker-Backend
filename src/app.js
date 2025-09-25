import cors from "cors";
import express from "express";
import authRoutes from "../routes/authRoutes.js";
import transactionRoutes from "../routes/transactionRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// mount routes
app.use("/api/routes", authRoutes);
app.use("/api/routes", transactionRoutes);

export default app;
