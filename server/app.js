const express = require("express");
// const helmet = require("helmet");
// const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser")
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const usersRoutes = require("./routes/usersRoutes");
const climbRecordsRoutes = require("./routes/climbRecordsRoutes");
const gymsRoutes = require("./routes/gymsRoutes");
const customRoutes = require("./routes/customRoutes");
const mapsRoutes = require("./routes/mapsRoutes");
const friendsRoutes = require("./routes/friendsRoutes");

const app = express();
const PORT = 7000;
dotenv.config();

const corsOptions = {
  origin: ["https://me2vegan.com", "http://localhost:3000"],
  methods: "GET, HEAD, PUT, PATCH, DELETE",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
// app.use(helmet());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB", err);
});

app.use("/api/users", usersRoutes);
app.use("/api/climbRecords", climbRecordsRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/gyms", gymsRoutes);
app.use("/api/custom", customRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
