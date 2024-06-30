const express = require("express");
const router = express.Router();
const climbRecordsController = require("../controllers/climbRecordsController");
const upload = require("../config/multerConfig");

const uploadFiles = upload.array("files", 5);

// const uploadFiles = upload.fields([
//     { name: 'records[0][files]', maxCount: 5 },
//     { name: 'records[1][files]', maxCount: 5 },
//     { name: 'records[2][files]', maxCount: 5 },
//     { name: 'records[3][files]', maxCount: 5 },
//     { name: 'records[4][files]', maxCount: 5 },
// ]);

router.post("/create", uploadFiles, climbRecordsController.createClimbRecords);
router.get("/exploreWall", climbRecordsController.getExploresRecords);
router.get("/exploreWall/:userId", climbRecordsController.getExploresRecordsByUser);
router.get("/exploreWall/share/:id", climbRecordsController.getExploresRecordsById);
router.post("/addLike/:id", climbRecordsController.addExploresLike);
router.post("/addComment/:id", climbRecordsController.addExploresComment);
router.get("/:userId", climbRecordsController.getClimbRecordsByUserId);

module.exports = router;