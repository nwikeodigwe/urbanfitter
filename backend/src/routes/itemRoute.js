const express = require("express");
const auth = require("../middleware/auth");
const itemController = require("../controllers/itemController");
const router = express.Router();

router.post("/", itemController.createItem);

router.get("/", itemController.getItem);

router.get("/:item", itemController.getItemById);

router.post("/:item/favorite", itemController.favoriteItem);

router.delete("/:item/unfavorite", itemController.unfavoriteItem);

router.put("/:item/upvote", itemController.upvoteItem);

router.put("/:item/downvote", itemController.downvoteItem);

router.delete("/:item/unvote", itemController.unvoteItem);

router.patch("/:item", itemController.updateItem);

router.delete("/:item", itemController.deleteItem);

module.exports = router;
