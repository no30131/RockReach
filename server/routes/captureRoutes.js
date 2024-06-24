const express = require("express");
const { captureScreenshot } = require("../controllers/captureController");

const router = express.Router();

router.post("/capture", captureScreenshot);

module.exports = router;