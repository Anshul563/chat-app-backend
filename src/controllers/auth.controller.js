import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import { sendOtpEmail } from "../utils/sendOtp.js";
import jwt from "jsonwebtoken";

export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const existingUser = await User.findOne({
      username: username.toLowerCase(),
    });

    return res.json({
      available: !existingUser,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
    } = req.body;

    // Validation
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check existing user
    const userExists = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Remove previous OTPs
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Save OTP
    await Otp.create({
      email: email.toLowerCase(),
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send OTP email
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error); // 👈 ADD THIS
    res.status(500).json({
      message: "Server error",
      error: error.message, // 👈 TEMPORARY (for debug)
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, firstName, lastName, username, password } = req.body;

    if (!email || !otp || !firstName || !lastName || !username || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({ message: "OTP expired" });
    }

    const isOtpValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
    });

    // Delete OTP after success
    await Otp.deleteOne({ email: email.toLowerCase() });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const forgotPasswordSendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Remove old OTPs
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Save OTP
    await Otp.create({
      email: email.toLowerCase(),
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send email
    await sendOtpEmail(email, otp);

    return res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const forgotPasswordVerifyOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const otpRecord = await Otp.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ email: email.toLowerCase() });
      return res.status(400).json({ message: "OTP expired" });
    }

    const isOtpValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.updateOne(
      { email: email.toLowerCase() },
      { passwordHash }
    );

    // Delete OTP
    await Otp.deleteOne({ email: email.toLowerCase() });

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // identifier = email OR username

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};