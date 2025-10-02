import express from "express";
import { getUserInfo, updateUserInfo } from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// set Route
router.get("/user", authMiddleware, getUserInfo);
router.patch("/user", authMiddleware, updateUserInfo);

export default router;
