const express = require("express");
const router = express.Router();
const friendsController = require("../controllers/friendsController");

router.post("/create", friendsController.createFriends);
router.post("/addChat", friendsController.addChatMessage);
router.get("/chat/:userId/:friendId", friendsController.getChatByFriendId);
router.get("/:userId", friendsController.getFriendsByUserId);

module.exports = router;