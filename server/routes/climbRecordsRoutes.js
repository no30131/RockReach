const express = require("express");
const router = express.Router();
const climbRecordsController = require("../controllers/climbRecordsController");

router.post("/create", climbRecordsController.createClimbRecords);
router.get("/:id", climbRecordsController.getClimbRecordsById);

module.exports = router;