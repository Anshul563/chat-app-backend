import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createGroup,
  addMemberToGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", authMiddleware, createGroup);
router.post("/add-member", authMiddleware, addMemberToGroup);

export default router;
