const express = require("express");
const auth = require("../middleware/auth");
const styleController = require("../controllers/styleController");
const router = express.Router();

router.post("/", styleController.createStyle);

router.get("/", styleController.getAllStyle);

router.get("/me", styleController.getStyle);

router.get("/:style", styleController.getStyleById);

router.post("/:style/comment", styleController.createComment);

router.post(
  "/:style/comment/:comment",
  [auth],
  styleController.createCommentComment
);

router.get("/:style/comments", styleController.getStyleComment);

router.delete("/comment/:comment", styleController.deleteComment);

router.patch("/:style", styleController.updateStyle);

router.post("/:style/favorite", styleController.favoriteStyle);

router.delete("/:style/unfavorite", styleController.unfavoriteStyle);

router.put("/:style/upvote", styleController.upvoteStyle);

router.put("/:style/downvote", styleController.downvoteStyle);

router.delete("/:style/unvote", styleController.unvoteStyle);

router.patch("/:style/publish", styleController.publishStyle);

router.patch("/:style/unpublish", styleController.unpublishStyle);

router.delete("/:style", styleController.deleteStyle);

module.exports = router;
