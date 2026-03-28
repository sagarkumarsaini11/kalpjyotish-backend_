// const PrivateChat = require("../models/PrivateChat");
// const createChatHash = require("../utilis/chatHash");
// const { chargeUserUsage } = require("../utilis/billing");

// module.exports = (io) => {
//   io.on("connection", (socket) => {

//     console.log("✅ USER CONNECTED:", socket.id);

//     /// 🔥 USER ROOM JOIN
//     socket.on("joinUserRoom", ({ userId }) => {
//       if (!userId) return;

//       const room = `user:${userId}`;
//       socket.join(room);

//       console.log("👤 JOIN USER ROOM:", room);
//     });

//     /* ======================
//        JOIN CHAT ROOM
//     ====================== */
//     socket.on("joinChat", ({ userId, astrologerId }) => {

//       if (!userId || !astrologerId) {
//         socket.emit("chatError", { message: "userId and astrologerId required" });
//         return;
//       }

//       const chatId = createChatHash(userId, astrologerId);

//       socket.join(chatId);

//       console.log("💬 JOIN CHAT:", chatId);

//       socket.emit("joined", { chatId });
//     });

//     /* ======================
//        SEND MESSAGE
//     ====================== */
//     socket.on("sendMessage", async (data) => {

//       try {
//         const { userId, astrologerId, senderId, senderType, message } = data || {};

//         if (!userId || !astrologerId || !senderId || !senderType || !message) {
//           socket.emit("chatError", { message: "Invalid payload" });
//           return;
//         }

//         const chatId = createChatHash(userId, astrologerId);

//         const saved = await PrivateChat.create({
//           chatId,
//           senderId,
//           receiverId: senderType === "user" ? astrologerId : userId,
//           message,
//           senderType,
//         });

//         /// 🔥 FIX EVENT NAME
//         io.to(chatId).emit("newMessage", {
//           chatId,
//           message: saved.message,
//           senderId: saved.senderId,
//           senderType: saved.senderType,
//         });

//         console.log("📩 MESSAGE SENT:", saved.message);

//       } catch (err) {
//         console.log("❌ ERROR:", err);
//         socket.emit("chatError", { message: "Failed to send message" });
//       }
//     });

//   });
// };



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
        io.to(`user: ${astrologerId}`).emit("threadUpdated", {
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
