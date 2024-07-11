const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.post("/create", usersController.createUser);
router.post("/login", usersController.loginUser);
router.get("/check-email/:email", usersController.checkEmail);
router.get("/check-name/:name", usersController.checkName);
router.get("/name/:name", usersController.getUserByName);
router.get("/:userId", usersController.getUserById);

module.exports = router;