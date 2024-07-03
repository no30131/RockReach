const express = require("express");
const router = express.Router();
const customsController = require("../controllers/customsController");
// const upload = require("../config/multerConfig");

// router.post("/create", upload.single('image'), customsController.createCustoms);
// router.post("/process", upload.single('image'), customsController.processImage);

router.post("/create", customsController.createCustoms);
router.post("/process", customsController.processImage);
router.get("/walls", customsController.getCustomsWalls);
router.get("/walls/:wallName", customsController.getCustomsWallRoutes);
router.get("/walls/share/:id", customsController.getCustomsWallRouteById);

router.get("/achievement/walls", customsController.getAchievementWalls);
router.get("/achievement/walls/:wallName", customsController.getAchievementRoutes);

module.exports = router;