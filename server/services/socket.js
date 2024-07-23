const socketIo = require("socket.io");
const { saveChatMessage } = require("../controllers/friendsController");

const initializeSocket = (server, corsOptions) => {
  const io = socketIo(server, { cors: corsOptions });

  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ friendId }) => {
      socket.join(friendId);
    });

    socket.on("sendMessage", async ({ friendId, talker, message }) => {
      try {
        const newChat = await saveChatMessage(talker, friendId, message);
        io.to(friendId).emit("receiveMessage", newChat);
      } catch (error) {
        console.error("Error: ", error);
      }
    });

    socket.on("disconnect", () => {
    });
  });
};

module.exports = initializeSocket;
