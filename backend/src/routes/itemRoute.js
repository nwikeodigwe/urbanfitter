const express = require("express");
const auth = require("../middleware/auth");
const itemController = require("../controllers/itemController");
const router = express.Router();

router.post("/", [auth], itemController.createItem);

router.get("/", [auth], itemController.getItem);

router.get("/:item", [auth], itemController.getItemById);

router.post("/:item/favorite", [auth], itemController.favoriteItem);

router.delete("/:item/unfavorite", [auth], itemController.unfavoriteItem);

router.put("/:item/upvote", [auth], itemController.upvoteItem);

router.put("/:item/downvote", [auth], itemController.downvoteItem);

router.delete("/:item/unvote", [auth], itemController.unvoteItem);

router.patch("/:item", [auth], itemController.updateItem);

router.delete("/:item", [auth], itemController.deleteItem);

module.exports = router;
