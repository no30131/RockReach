const express = require("express");
const router = express.Router();
const footprintsController = require("../controllers/footprintsController");

// router.post("/create", footprintsController.createUser);
// router.post("login", footprintsController.loginUser);
router.get("/:userId", footprintsController.getUserById);

module.exports = router;

//現在footprints表是空的，所以get userId不會拿到任何東西。只有在Uploads頁面上傳攀岩紀錄後才會新增一筆資料到這個表