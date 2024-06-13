const express = require("express");
const router = express.Router();
const friendsController = require("../controllers/friendsController");

router.post("/create", friendsController.createFriends);
router.get("/:id", friendsController.getFriendsById);

module.exports = router;