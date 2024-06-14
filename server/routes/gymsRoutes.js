const express = require("express");
const router = express.Router();
const gymsController = require("../controllers/gymsController");

router.post("/create", gymsController.createGyms);
router.get("/all", gymsController.getAllGyms);
router.get("/:id", gymsController.getGymsById);

module.exports = router;