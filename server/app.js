const express = require("express");
// const helmet = require("helmet");
// const fs = require("fs");
const cors = require("cors");
// const bodyParser = require("body-parser")
// const mongoose = require("mongoose");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
const PORT = 7000;

const corsOptions = {
  origin: ["*"],
  // origin: ["https://me2vegan.com"],
  methods: "GET, HEAD, PUT, PATCH, DELETE",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
// app.use(helmet());

app.use("/api", uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
