const express = require("express");
const router = express.Router();
const achievementsController = require("../controllers/achievementsController");

router.post("/create", achievementsController.createAchievement);
router.get("/:userId", achievementsController.getAchievementsByUser);

module.exports = router;