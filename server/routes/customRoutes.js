const express = require("express");
const router = express.Router();
const customController = require("../controllers/customController");
const upload = require("../config/multerConfig");

const uploadSingle = upload.single("image");

router.post("/create", uploadSingle, customController.createCustom);
// router.post("login", customController.loginUser);
// router.get("/:id", customController.getUserById);

module.exports = router;