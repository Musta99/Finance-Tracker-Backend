import cors from "cors";
import express from "express";
import authRoutes from "../routes/authRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// mount routes
app.use("/api/routes", authRoutes);

export default app;
