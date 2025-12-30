import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },
    pushToken: {
      type: String,
      default: "",
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    mutedChats: [
      {
        chatId: {
          type: mongoose.Schema.Types.ObjectId, // userId OR groupId
        },
        type: {
          type: String, // "private" | "group"
          enum: ["private", "group"],
        },
        mutedUntil: {
          type: Date, // null = forever
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
