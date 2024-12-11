const express = require("express");
const auth = require("../middleware/auth");
const collectionController = require("../controllers/collectionController");
const router = express.Router();

router.post("/", [auth], collectionController.createCollection);

router.get("/", [auth], collectionController.getCollections);

router.get("/:collection", [auth], collectionController.getCollectionById);

router.get(
  "/:collection/styles",
  [auth],
  collectionController.getCollectionStyles
);

router.post(
  "/:collection/favorite",
  [auth],
  collectionController.favoriteCollection
);

router.delete(
  "/:collection/unfavorite",
  [auth],
  collectionController.unfavoriteCollection
);

router.put(
  "/:collection/upvote",
  [auth],
  collectionController.upvoteCollection
);

router.put(
  "/:collection/downvote",
  [auth],
  collectionController.downvoteCollection
);

router.delete(
  "/:collection/unvote",
  [auth],
  collectionController.unvoteCollection
);

router.patch("/:collection", [auth], collectionController.updateCollection);

router.delete("/:collection", [auth], collectionController.deleteCollection);

module.exports = router;
