const express = require("express");
const auth = require("../middleware/auth");
const brandController = require("../controllers/brandController");
const router = express.Router();

router.post("/", [auth], brandController.createBrand);

router.get("/", [auth], brandController.getAllBrands);

router.get("/:brand", [auth], brandController.getBrandById);

router.patch("/:brand", [auth], brandController.updateBrand);

router.post("/:brand/favorite", [auth], brandController.favoriteBrand);

router.delete("/:brand/unfavorite", [auth], brandController.unfavoriteBrand);

router.put("/:brand/upvote", [auth], brandController.upvoteBrand);

router.put("/:brand/downvote", [auth], brandController.downvoteBrand);

router.delete("/:brand/unvote", [auth], brandController.unvoteBrand);

router.post("/:brand/subscribe", [auth], brandController.subscribeToBrand);

router.delete(
  "/:brand/unsubscribe",
  [auth],
  brandController.unsubscribeFromBrand
);

router.post("/:brand/comment", [auth], brandController.commentOnBrand);

router.post(
  "/:brand/comment/:comment",
  [auth],
  brandController.commentOnComment
);

router.get("/:brand/comments", [auth], brandController.getBrandComment);

router.delete("/comment/:comment", [auth], brandController.deleteComment);

router.delete("/:brand", [auth], brandController.deleteBrand);

module.exports = router;
