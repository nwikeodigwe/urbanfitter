const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.get("/", userController.getAllUsers);

router.post("/:user/subscribe", userController.subscribeToUser);

router.delete("/:user/unsubscribe", userController.unsubscribeFromUser);

router.get("/me", userController.getUser);

router.get("/:user/style", userController.getUserStyle);

router.get("/:user/collection", userController.getUserCollection);

router.patch("/me", userController.updateUser);

router.patch("/profile", userController.updateProfile);

router.patch("/password", userController.updatePassword);

router.get("/:user", userController.getUserById);

module.exports = router;
