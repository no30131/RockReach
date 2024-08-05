const express = require("express");
const router = express.Router();
const climbRecordsController = require("../controllers/climbRecordsController");
const upload = require("../config/multerConfig");
const multer = require("multer");
 
const uploadFiles = upload.array('files', 10);

router.post("/create", (req, res, next) => {
    uploadFiles(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "單個文件大小不能超過300MB" });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ message: "最多可以上傳10個文件" });
        }
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }, climbRecordsController.createClimbRecords);

router.get("/exploreWall", climbRecordsController.getExploresRecords);
router.get("/exploreWall/sorted/:userId", climbRecordsController.getSortedClimbRecords);
router.get("/exploreWall/share/:id", climbRecordsController.getExploresRecordsById);
router.get("/exploreWall/:userId", climbRecordsController.getExploresRecordsByUser);
router.put("/exploreWall/:id/comment", climbRecordsController.addExploresComment);
router.put("/exploreWall/:id/like", climbRecordsController.addExploresLike);
router.delete("/exploreWall/:id/like", climbRecordsController.removeExploresLike);

router.get("/:userId", climbRecordsController.getClimbRecordsByUserId);
router.delete("/:id", climbRecordsController.removeClimbRecord);
 
module.exports = router;