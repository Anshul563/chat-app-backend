import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import User from "../models/User.js";
import {
  searchUsers,
  savePushToken,
  blockUser,
  unblockUser,
  muteChat,
  unmuteChat,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", authMiddleware, searchUsers);
router.post("/save-push-token", authMiddleware, savePushToken);

router.post("/block", authMiddleware, blockUser);
router.post("/unblock", authMiddleware, unblockUser);

router.post("/mute", authMiddleware, muteChat);
router.post("/unmute", authMiddleware, unmuteChat);

// Protected route
router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");

  res.json(user);
});

export default router;
