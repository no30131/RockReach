const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIo = require("socket.io");
const moment = require("moment-timezone");
const errorHandler = require("./utils/errorHandler");

const usersRoutes = require("./routes/usersRoutes");
const climbRecordsRoutes = require("./routes/climbRecordsRoutes");
const gymsRoutes = require("./routes/gymsRoutes");
const customsRoutes = require("./routes/customsRoutes");
const achievementsRoutes = require("./routes/achievementsRoutes");
const footprintsRoutes = require("./routes/footprintsRoutes");
const friendsRoutes = require("./routes/friendsRoutes");
const { saveChatMessage } = require("./controllers/friendsController");

const app = express();
const PORT = process.env.PORT || 7000;
dotenv.config();
const server = http.createServer(app);

const corsOptions = {
  origin: ["https://rockreach.me2vegan.com", "http://localhost:3000"],
  methods: "GET, HEAD, PUT, PATCH, DELETE",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

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

  socket.on("disconnect", () => {});
});

app.use("/api/users", usersRoutes);
app.use("/api/climbRecords", climbRecordsRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/footprints", footprintsRoutes);
app.use("/api/gyms", gymsRoutes);
app.use("/api/customs", customsRoutes);
app.use("/api/achievements", achievementsRoutes);

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
