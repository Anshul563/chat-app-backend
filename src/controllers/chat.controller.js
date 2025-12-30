import Message from "../models/Message.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const getRecentChats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    // 1️⃣ Get last messages (DMs + Groups)
    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { receiver: userId },
            { group: { $exists: true } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $ifNull: ["$group", false] },
              { group: "$group" },
              {
                $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
              },
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    const chats = [];

    for (const item of lastMessages) {
      // GROUP CHAT
      if (item._id.group) {
        const group = await Group.findById(item._id.group);

        if (!group || !group.members.includes(req.userId)) continue;

        const unreadCount = await Message.countDocuments({
          group: group._id,
          readBy: { $ne: userId },
          sender: { $ne: userId },
        });

        chats.push({
          type: "group",
          id: group._id,
          name: group.name,
          avatar: group.avatar,
          lastMessage: item.lastMessage.content,
          lastMessageType: item.lastMessage.type,
          lastMessageAt: item.lastMessage.createdAt,
          unreadCount,
        });
      }

      // 1-TO-1 CHAT
      else {
        const otherUser = await User.findById(item._id);

        if (!otherUser) continue;

        const unreadCount = await Message.countDocuments({
          sender: otherUser._id,
          receiver: userId,
          readBy: { $ne: userId },
        });

        chats.push({
          type: "private",
          id: otherUser._id,
          name: `${otherUser.firstName} ${otherUser.lastName}`,
          username: otherUser.username,
          avatar: otherUser.avatar,
          lastMessage: item.lastMessage.content,
          lastMessageType: item.lastMessage.type,
          lastMessageAt: item.lastMessage.createdAt,
          unreadCount,
        });
      }
    }

    res.json(chats);
  } catch (error) {
    console.error("Chat List Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const clearPrivateChat = async (req, res) => {
  const { userId } = req.body; // other user

  if (!userId) {
    return res.status(400).json({ message: "UserId required" });
  }

  await Message.updateMany(
    {
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId },
      ],
      deletedFor: { $ne: req.userId },
    },
    {
      $addToSet: { deletedFor: req.userId },
    }
  );

  res.json({ message: "Chat cleared" });
};

export const clearGroupChat = async (req, res) => {
  const { groupId } = req.body;

  if (!groupId) {
    return res.status(400).json({ message: "GroupId required" });
  }

  await Message.updateMany(
    {
      group: groupId,
      deletedFor: { $ne: req.userId },
    },
    {
      $addToSet: { deletedFor: req.userId },
    }
  );

  res.json({ message: "Group chat cleared" });
};
