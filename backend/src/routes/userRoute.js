const express = require("express");
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");
const router = express.Router();

router.get("/", [auth], userController.getAllUsers);

router.post("/:user/subscribe", [auth], userController.subscribeToUser);

router.delete("/:user/unsubscribe", [auth], userController.unsubscribeFromUser);

router.get("/me", [auth], userController.getUser);

router.patch("/me", [auth], userController.updateUser);

router.patch("/profile", [auth], userController.updateProfile);

router.patch("/password", [auth], userController.updatePassword);

router.get("/:user", [auth], userController.getUserById);

module.exports = router;
