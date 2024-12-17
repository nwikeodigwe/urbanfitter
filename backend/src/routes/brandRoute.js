const express = require("express");
const auth = require("../middleware/auth");
const brandController = require("../controllers/brandController");
const router = express.Router();

router.post("/", brandController.createBrand);

router.get("/", brandController.getAllBrands);

router.get("/:brand", brandController.getBrandById);

router.patch("/:brand", brandController.updateBrand);

router.post("/:brand/favorite", brandController.favoriteBrand);

router.delete("/:brand/unfavorite", brandController.unfavoriteBrand);

router.put("/:brand/upvote", brandController.upvoteBrand);

router.put("/:brand/downvote", brandController.downvoteBrand);

router.delete("/:brand/unvote", brandController.unvoteBrand);

router.post("/:brand/subscribe", brandController.subscribeToBrand);

router.delete("/:brand/unsubscribe", brandController.unsubscribeFromBrand);

router.post("/:brand/comment", brandController.commentOnBrand);

router.post("/:brand/comment/:comment", brandController.commentOnComment);

router.get("/:brand/comments", brandController.getBrandComment);

router.delete("/comment/:comment", brandController.deleteComment);

router.delete("/:brand", brandController.deleteBrand);

module.exports = router;
