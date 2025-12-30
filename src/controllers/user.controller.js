import User from "../models/User.js";

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    // Get current user (to know whom they blocked)
    const me = await User.findById(req.userId).select("blockedUsers");

    const users = await User.find({
      _id: {
        $ne: req.userId, // ❌ exclude self
        $nin: me.blockedUsers, // ❌ exclude users I blocked
      },
      blockedUsers: { $ne: req.userId }, // ❌ exclude users who blocked me
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("_id firstName lastName username email avatar")
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const savePushToken = async (req, res) => {
  const { pushToken } = req.body;

  if (!pushToken) return res.sendStatus(400);

  await User.findByIdAndUpdate(req.userId, { pushToken });
  res.sendStatus(200);
};

export const blockUser = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId required" });
  }

  await User.findByIdAndUpdate(req.userId, {
    $addToSet: { blockedUsers: userId },
  });

  res.json({ message: "User blocked" });
};

export const unblockUser = async (req, res) => {
  const { userId } = req.body;

  await User.findByIdAndUpdate(req.userId, {
    $pull: { blockedUsers: userId },
  });

  res.json({ message: "User unblocked" });
};

export const muteChat = async (req, res) => {
  const { chatId, type, duration } = req.body;
  // duration: "8h" | "1w" | "forever"

  if (!chatId || !type) {
    return res.status(400).json({ message: "Invalid data" });
  }

  let mutedUntil = null;

  if (duration === "8h") {
    mutedUntil = new Date(Date.now() + 8 * 60 * 60 * 1000);
  } else if (duration === "1w") {
    mutedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  await User.findByIdAndUpdate(req.userId, {
    $pull: { mutedChats: { chatId } }, // remove old mute
  });

  await User.findByIdAndUpdate(req.userId, {
    $push: {
      mutedChats: { chatId, type, mutedUntil },
    },
  });

  res.json({ message: "Chat muted" });
};

export const unmuteChat = async (req, res) => {
  const { chatId } = req.body;

  await User.findByIdAndUpdate(req.userId, {
    $pull: { mutedChats: { chatId } },
  });

  res.json({ message: "Chat unmuted" });
};
