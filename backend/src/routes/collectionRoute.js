const express = require("express");
const auth = require("../middleware/auth");
const collectionController = require("../controllers/collectionController");
const router = express.Router();

router.post("/", collectionController.createCollection);

router.get("/", collectionController.getCollections);

router.get("/:collection", collectionController.getCollectionById);

router.get("/:collection/styles", collectionController.getCollectionStyles);

router.post("/:collection/favorite", collectionController.favoriteCollection);

router.delete(
  "/:collection/unfavorite",
  collectionController.unfavoriteCollection
);

router.put("/:collection/upvote", collectionController.upvoteCollection);

router.put("/:collection/downvote", collectionController.downvoteCollection);

router.delete("/:collection/unvote", collectionController.unvoteCollection);

router.patch("/:collection", collectionController.updateCollection);

router.delete("/:collection", collectionController.deleteCollection);

module.exports = router;
