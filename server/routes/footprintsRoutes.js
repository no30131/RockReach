const express = require("express");
const router = express.Router();
const footprintsController = require("../controllers/footprintsController");

router.post("/create", footprintsController.createOrUpdateFootprint);
router.get("/:userId", footprintsController.getFootprintByUserId);

module.exports = router;