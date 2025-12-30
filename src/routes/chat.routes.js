import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { getRecentChats, clearPrivateChat, clearGroupChat } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getRecentChats);
router.post("/clear/private", authMiddleware, clearPrivateChat);
router.post("/clear/group", authMiddleware, clearGroupChat);

export default router;
