const express = require("express");
const router = express.Router();
const customsController = require("../controllers/customsController");

// const upload = require("../config/multerConfig");
// const uploadSingle = upload.single("image");
// router.post("/create", uploadSingle, customsController.createCustoms);

router.post("/create", customsController.createCustoms);
router.post("/process", customsController.processImage);
router.get("/walls", customsController.getCustomsWalls);
router.get("/walls/:wallName", customsController.getCustomsWallRoutes);

// router.post("/achievement/create", customsController.createAchievement);
router.post("/achievement/process", customsController.processAchievementImage);
router.get("/achievement/walls", customsController.getAchievementWalls);
// router.get("/achievement/walls/:wallName", customsController.getAchievementWallRoutes);

module.exports = router;