import express from "express";
import {
  checkUsername,
  registerUser,
  verifyOtp,
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
  loginUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/check-username", checkUsername);
router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);

// Auth
router.post("/login", loginUser);

// 🔐 Forgot password
router.post("/forgot-password/send-otp", forgotPasswordSendOtp);
router.post("/forgot-password/verify-otp", forgotPasswordVerifyOtp);

export default router;
