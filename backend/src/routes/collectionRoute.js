const express = require("express");
const Collection = require("../utils/Collection");
const Style = require("../utils/Style");
const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(400)
      .json({ message: "name and description is required" });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res.status(400).json({ message: "tags must be an array" });

  let collectionData = {};

  if (!!req.body.tags && req.body.tags.length > 0)
    collectionData.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  collectionData = {
    name: req.body.name,
    description: req.body.description,
    authorId: req.user.id,
  };

  let collection = new Collection();
  collection = await collection.save(collectionData);

  res.status(201).json({ collection });
});

router.get("/", async (req, res) => {
  let collections = new Collection();
  collections = await collections.findMany();

  if (!collections.length)
    return res.status(404).json({ message: "No collection found" });

  res.status(200).json({ collections });
});

router.get("/:collection", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  collection = await collection.find();

  if (!collection)
    return res.status(404).json({ message: "Collection not found" });

  res.status(200).json({ collection });
});

router.get("/:collection/styles", async (req, res) => {
  let styles = new Style();
  styles.collectionId = req.params.collection;
  styles = await styles.findMany();

  if (!styles.length)
    return res.status(404).json({ message: "No style found" });

  res.status(200).json({ styles });
});

router.post("/:collection/favorite", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res.status(404).json({ message: "Collection not found" });

  let favorite = await collection.favorite(req.user.id);

  res.status(201).json({ favorite });
});

router.delete("/:collection/unfavorite", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res.status(404).json({ message: "Collection not found" });

  let favorite = await collection.isFavorited(req.user.id);

  if (!favorite)
    return res.status(404).json({ message: "Collection is not favorited" });

  await collection.unfavorite(req.user.id);

  res.status(204).end();
});

router.put("/:collection/upvote", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res.status(404).json({ message: "Collection not found" });

  const upvote = await collection.upvote(req.user.id);

  res.status(200).json({ upvote });
});

router.put("/:collection/downvote", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res.status(404).json({ message: "collection not found" });

  const downvote = await collection.downvote(req.user.id);

  res.status(200).json({ downvote });
});

router.delete("/:collection/unvote", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res.status(404).json({ message: "Collection not found" });

  const vote = await collection.isVoted(req.user.id);

  if (!vote) return res.status(404).json({ message: "Vote not found" });

  await collection.unvote(req.user.id);

  res.status(204).end();
});

router.patch("/:collection", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res.status(404).json({ message: "Collection not found" });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res.status(400).json({ message: "tags must be an array" });

  let collectionData = { ...req.body };
  if (req.body.tags && req.body.tags.length > 0)
    collectionData.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  collection = collection.save(collectionData);

  res.status(200).json({ collection });
});

router.delete("/:collection", async (req, res) => {
  let collection = new Collection();
  collection.id = req.params.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res.status(404).json({ message: "Collection not found" });

  await collection.delete();

  res.status(204).end();
});

module.exports = router;
