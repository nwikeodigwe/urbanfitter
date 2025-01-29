const express = require("express");
const Item = require("../utils/Item");
const User = require("../utils/User");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(400)
      .json({ message: "Name and description is required" });

  if (!Array.isArray(req.body.images) || req.body.images.length === 0)
    return res.status(400).json({ message: "At least one image is required" });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res.status(400).json({ message: "Tags must be an array" });

  let itemData = { ...req.body };

  if (req.body.tags && req.body.tags.length > 0)
    itemData.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  if (!req.body.brand)
    return res.status(400).json({ message: "Brand is required" });

  itemData.brand = req.body.brand
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "");

  if (req.body.creator) {
    let creator = new User();
    creator = await creator.find({ id: req.body.creator });

    if (!creator) return res.status(404).json({ message: "Creator not found" });

    itemData.creator = creator.id;
  }

  let item = new Item();
  item = await item.save(itemData);

  res.status(201).json({ item });
});

router.get("/", async (req, res) => {
  let items = new Item();
  items = await items.findMany();

  if (!items.length) return res.status(404).json({ message: "No item found" });

  res.status(200).json({ items });
});

router.get("/:item", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  item = await item.find();

  if (!item) return res.status(404).json({ message: "Item not found" });

  res.status(200).json({ item });
});

router.post("/:item/favorite", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists) return res.status(404).json({ message: "item not found" });

  const favorite = await item.favorite(req.user.id);

  res.status(201).json({ favorite });
});

router.delete("/:item/unfavorite", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists) return res.status(404).json({ message: "item not found" });

  let favorite = await item.isFavorited(req.user.id);

  if (!favorite)
    return res.status(400).json({ message: "item is not favorited" });

  await item.unfavorite(req.user.id);

  res.status(204).end();
});

router.put("/:item/upvote", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists) return res.status(404).json({ message: "Item not found" });

  const upvote = await item.upvote(req.user.id);

  res.status(200).json({ upvote });
});

router.put("/:item/downvote", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists) return res.status(404).json({ message: "Item not found" });

  const downvote = await item.downvote(req.user.id);

  res.status(200).json({ downvote });
});

router.delete("/:item/unvote", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists) return res.status(404).json({ message: "Item not found" });

  await item.unvote(req.user.id);

  res.status(204).end();
});

router.patch("/:item", async (req, res) => {
  if (
    req.body.images &&
    (!Array.isArray(req.body.images) || req.body.images.length === 0)
  )
    return res.status(400).json({ message: "At least one image is required" });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res.status(400).json({ message: "Tags must be an array" });

  let itemData = { ...req.body };

  if (!!req.body.tags && req.body.tags.length > 0)
    itemData.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists) return res.status(404).json({ message: "Item not found" });

  item = await item.save(itemData);

  res.status(200).json({ item });
});

router.delete("/:item", async (req, res) => {
  let item = new Item();
  item.id = req.params.item;
  let itemExists = await item.find();

  if (!itemExists) return res.status(404).json({ message: "Item not found" });

  await item.delete();

  res.status(204).end();
});

module.exports = router;
