const express = require("express");
const router = express.Router();
const climbRecordsController = require("../controllers/climbRecordsController");
const upload = require("../config/multerConfig");

const uploadFiles = upload.array('files', 5);

router.post("/create", uploadFiles, climbRecordsController.createClimbRecords);
router.get("/exploreWall", climbRecordsController.getExploresRecords);
router.get("/exploreWall/:userId", climbRecordsController.getExploresRecordsByUser);
router.get("/exploreWall/share/:id", climbRecordsController.getExploresRecordsById);
router.post("/addLike/:id", climbRecordsController.addExploresLike);
router.post("/addComment/:id", climbRecordsController.addExploresComment);
router.get("/:userId", climbRecordsController.getClimbRecordsByUserId);

module.exports = router;