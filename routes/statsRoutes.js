import express from "express";
import { monthlyStats } from "../controllers/statsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/stats", monthlyStats);

export default router;
