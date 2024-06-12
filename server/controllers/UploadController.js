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
const upload = multer({ storage: storage });

const uploadFile = (req, res) => {
  try {
    const description = req.body.description;
    const file = req.file;

    if (!file) {
      return readdirSync.status(400).json({ message: "No file uploaded" });
    }

    console.log(description);
    res.status(200).json({ message: "Files uploaded successfully", file });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  upload,
  uploadFile,
};
