const express = require("express");
const router = express.Router();
const climbRecordsController = require("../controllers/climbRecordsController");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1000);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "video/mp4",
    "video/mpeg",
    "video/x-msvideo",
    "video/quicktime",
    "video/x-ms-wmv",
    "video/x-flv",
    "video/x-matroska",
    "video/3gpp",
    "video/3gpp2",
    "video/HEVC",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { files: 5 },
});

const uploadFiles = upload.array("files", 5);

router.post("/create", uploadFiles, climbRecordsController.createClimbRecords);
router.get("/:id", climbRecordsController.getClimbRecordsById);

module.exports = router;

