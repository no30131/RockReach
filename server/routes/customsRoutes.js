const express = require("express");
const router = express.Router();
const customsController = require("../controllers/customsController");

// const upload = require("../config/multerConfig");
// const uploadSingle = upload.single("image");
// router.post("/create", uploadSingle, customsController.createCustoms);

router.post("/create", customsController.createCustoms);
router.post("/process", customsController.processImage);
router.get("/walls", customsController.getCustomsWalls);

module.exports = router;