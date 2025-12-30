import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "./models/Message.js";
import Group from "./models/Group.js";
import User from "./models/User.js";
import { sendPushNotification } from "./utils/sendPush.js";
import { isChatMuted } from "./utils/isMuted.js";

const onlineUsers = new Map(); // userId → socketId

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  /* ───────── JWT AUTH ───────── */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("🟢 Online:", socket.userId);

    onlineUsers.set(socket.userId, socket.id);
    io.emit("user-online", socket.userId);

    /* ───────── JOIN GROUP ROOMS ───────── */
    socket.on("join-groups", async () => {
      const groups = await Group.find({ members: socket.userId });
      groups.forEach((g) => socket.join(g._id.toString()));
    });

    /* ───────── PRIVATE MESSAGE ───────── */
    socket.on("send-message", async ({ receiverId, message }) => {
      const sender = await User.findById(socket.userId);
      const receiver = await User.findById(receiverId);

      if (!sender || !receiver) return;

      // 🚫 BLOCK CHECK (BOTH SIDES)
      if (
        sender.blockedUsers.includes(receiverId) ||
        receiver.blockedUsers.includes(socket.userId)
      ) {
        return;
      }

      const newMessage = await Message.create({
        sender: socket.userId,
        receiver: receiverId,
        content: message,
      });

      const receiverSocket = onlineUsers.get(receiverId);

      // 🔔 PUSH (only if offline + not muted)
      if (
        !receiverSocket &&
        receiver.pushToken &&
        !isChatMuted(receiver, socket.userId)
      ) {
        await sendPushNotification({
          pushToken: receiver.pushToken,
          title: "New message",
          body: message,
          data: {
            type: "private",
            userId: socket.userId,
          },
        });
      }

      // ✔ Delivered
      if (receiverSocket) {
        newMessage.deliveredTo.push(receiverId);
        await newMessage.save();

        io.to(receiverSocket).emit("receive-message", newMessage);
        io.to(socket.id).emit("message-delivered", {
          messageId: newMessage._id,
        });
      }
    });

    /* ───────── MARK SEEN ───────── */
    socket.on("mark-seen", async ({ chatType, userId, groupId }) => {
      if (chatType === "private") {
        await Message.updateMany(
          {
            sender: userId,
            receiver: socket.userId,
            readBy: { $ne: socket.userId },
          },
          { $addToSet: { readBy: socket.userId } }
        );

        const senderSocket = onlineUsers.get(userId);
        if (senderSocket) {
          io.to(senderSocket).emit("messages-seen", {
            by: socket.userId,
          });
        }
      }

      if (chatType === "group") {
        await Message.updateMany(
          {
            group: groupId,
            readBy: { $ne: socket.userId },
          },
          { $addToSet: { readBy: socket.userId } }
        );

        io.to(groupId).emit("group-messages-seen", {
          groupId,
          by: socket.userId,
        });
      }
    });

    /* ───────── GROUP MESSAGE ───────── */
    socket.on("send-group-message", async ({ groupId, message }) => {
      const group = await Group.findById(groupId).populate("members");
      if (!group || !group.members.some(m => m._id.toString() === socket.userId)) return;

      const newMessage = await Message.create({
        sender: socket.userId,
        group: groupId,
        content: message,
      });

      for (const member of group.members) {
        if (
          member._id.toString() !== socket.userId &&
          member.pushToken &&
          !onlineUsers.get(member._id.toString()) &&
          !isChatMuted(member, groupId)
        ) {
          await sendPushNotification({
            pushToken: member.pushToken,
            title: group.name,
            body: message,
            data: {
              type: "group",
              groupId,
            },
          });
        }
      }

      io.to(groupId).emit("receive-group-message", newMessage);
    });

    /* ───────── REACTIONS ───────── */
    socket.on("add-reaction", async ({ messageId, emoji }) => {
      const msg = await Message.findById(messageId);
      if (!msg) return;

      msg.reactions = msg.reactions.filter(
        (r) => r.user.toString() !== socket.userId
      );

      msg.reactions.push({ user: socket.userId, emoji });
      await msg.save();

      const room = msg.group ? msg.group.toString() : onlineUsers.get(
        msg.sender.toString() === socket.userId
          ? msg.receiver?.toString()
          : msg.sender?.toString()
      );

      if (room) {
        io.to(room).emit("reaction-updated", {
          messageId,
          reactions: msg.reactions,
        });
      }
    });

    socket.on("remove-reaction", async ({ messageId }) => {
      const msg = await Message.findById(messageId);
      if (!msg) return;

      msg.reactions = msg.reactions.filter(
        (r) => r.user.toString() !== socket.userId
      );
      await msg.save();

      io.emit("reaction-updated", {
        messageId,
        reactions: msg.reactions,
      });
    });

    /* ───────── TYPING ───────── */
    socket.on("typing", ({ receiverId }) => {
      const s = onlineUsers.get(receiverId);
      if (s) io.to(s).emit("typing", { userId: socket.userId });
    });

    socket.on("stop-typing", ({ receiverId }) => {
      const s = onlineUsers.get(receiverId);
      if (s) io.to(s).emit("stop-typing", { userId: socket.userId });
    });

    socket.on("group-typing", ({ groupId }) => {
      socket.to(groupId).emit("group-typing", {
        userId: socket.userId,
        groupId,
      });
    });

    socket.on("group-stop-typing", ({ groupId }) => {
      socket.to(groupId).emit("group-stop-typing", {
        userId: socket.userId,
        groupId,
      });
    });

    /* ───────── DISCONNECT ───────── */
    socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);
      io.emit("user-offline", socket.userId);
      console.log("🔴 Offline:", socket.userId);
    });
  });
};

export default initSocket;
