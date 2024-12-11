const express = require("express");
const auth = require("../middleware/auth");
const styleController = require("../controllers/styleController");
const router = express.Router();

router.post("/", [auth], styleController.createStyle);

router.get("/", [auth], styleController.getAllStyle);

router.get("/me", [auth], styleController.getStyle);

router.get("/:style", [auth], styleController.getStyleById);

router.post("/:style/comment", [auth], styleController.createComment);

router.post(
  "/:style/comment/:comment",
  [auth],
  styleController.createCommentComment
);

router.get("/:style/comments", [auth], styleController.getStyleComment);

router.delete("/comment/:comment", [auth], styleController.deleteComment);

router.patch("/:style", [auth], styleController.updateStyle);

router.post("/:style/favorite", [auth], styleController.favoriteStyle);

router.delete("/:style/unfavorite", [auth], styleController.unfavoriteStyle);

router.put("/:style/upvote", [auth], styleController.upvoteStyle);

router.put("/:style/downvote", [auth], styleController.downvoteStyle);

router.delete("/:style/unvote", [auth], styleController.unvoteStyle);

router.patch("/:style/publish", [auth], styleController.publishStyle);

router.patch("/:style/unpublish", [auth], styleController.unpublishStyle);

router.delete("/:style", [auth], styleController.deleteStyle);

module.exports = router;
