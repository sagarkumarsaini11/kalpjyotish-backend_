const PrivateChat = require("../models/PrivateChat");
const createChatHash = require("../utilis/chatHash");
const { chargeUserUsage } = require("../utilis/billing");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinUserRoom", ({ userId }) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
    });

    /* ======================
       Join private room
    ====================== */
    socket.on("joinChat", ({ userId, astrologerId }) => {
      if (!userId || !astrologerId) {
        socket.emit("chatError", { message: "userId and astrologerId are required" });
        return;
      }

      const chatId = createChatHash(userId, astrologerId);
      socket.join(chatId);
      socket.emit("joined", chatId);
    });


    /* ======================
       Send message
    ====================== */
    socket.on("sendMessage", async (data) => {
      try {
        const { userId, astrologerId, senderId, senderType, message } = data || {};
        if (!userId || !astrologerId || !senderId || !senderType || !message) {
          socket.emit("chatError", { message: "Invalid message payload" });
          return;
        }

        if (senderType === "user") {
          const charge = await chargeUserUsage({
            userId,
            astrologerId,
            serviceType: "chat",
            minutes: 1,
            allowPartial: false,
          });
          if (!charge.ok) {
            socket.emit("chatError", {
              code: "INSUFFICIENT_BALANCE",
              message: "Insufficient balance. Please recharge wallet.",
              data: charge,
            });
            return;
          }
        }

        const chatId = createChatHash(userId, astrologerId);

        const saved = await PrivateChat.create({
          chatId,
          senderId,
          receiverId: senderType === "user" ? astrologerId : userId,
          message,
          senderType,
        });

        io.to(chatId).emit("receiveMessage", saved);
        io.to(`user:${astrologerId}`).emit("threadUpdated", {
          chatId,
          userId,
          astrologerId,
          message: saved.message,
          senderType: saved.senderType,
        });
      } catch (err) {
        socket.emit("chatError", { message: "Failed to send message" });
      }
    });

  });
};
