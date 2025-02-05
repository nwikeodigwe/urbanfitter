const express = require("express");
const Brand = require("../utils/Brand");
const User = require("../utils/User");
const Comment = require("../utils/Comment");
const router = express.Router();

const ENTITY = "BRAND";

router.post("/", async (req, res) => {
  let brand = new Brand(req.body);

  if (!brand.name) return res.status(400).json({ message: "Name is required" });

  brand.name = brand.name
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 &]/g, "");

  if (brand.owner) brand.owner = brand.owner.trim().toLowerCase();

  if (brand.tags && !Array.isArray(brand.tags))
    return res.status(400).json({ message: "Tags must be an array" });

  if (brand.tags && brand.tags.length > 0)
    brand.tags = brand.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  if (brand.logo)
    return res
      .status(400)
      .json({ message: "No two brands can have the same logo" });

  logo = req.body.logo || undefined;

  let brandExists = await brand.find();

  if (brandExists)
    return res.status(400).json({ message: "Brand already exists" });

  if (!brand.owner) brand.owner = req.user.id;

  let user = new User();
  user = await user.find({
    id: brand.owner,
  });

  if (!user) brand.owner = req.user.id;

  brand = await brand.save();

  res.status(201).json({ brand });
});

router.get("/", async (req, res) => {
  let brands = new Brand();
  brands = await brands.findMany();

  if (!brands.length)
    return res.status(404).json({ message: "No brand found" });

  res.status(200).json({ brands });
});

router.get("/:brand", async (req, res) => {
  let brand = new Brand({ id: req.params.brand });
  brand = await brand.findById();

  if (!brand) return res.status(404).json({ message: "Brand not found" });

  res.status(200).json({ brand });
});

router.patch("/:brand", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  brand = await brand.find();

  if (!brand) return res.status(404).json({ message: "Brand not found" });

  brand = new Brand(req.body);
  brand.id = req.params.brand;
  brand.owner = req.user.id;

  brand.name = brand.name
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 &]/g, "");

  if (brand.tags && !Array.isArray(brand.tags))
    return res.status(400).json({ message: "Tags must be an array" });

  if (brand.tags && brand.tags.length > 0)
    brand.tags = brand.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  brand = await brand.save();

  res.status(200).json({ brand });
});

router.post("/:brand/favorite", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  brandExists = await brand.find();

  if (!brandExists) return res.status(404).json({ message: "brand not found" });

  let favorite = await brand.favorite(req.user.id);

  res.status(201).json({ favorite });
});

router.delete("/:brand/unfavorite", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists) return res.status(404).json({ message: "brand not found" });

  let favorite = await brand.isFavorited(req.user.id);

  if (!favorite)
    return res.status(404).json({ message: "brand is not favorited" });

  await brand.unfavorite(req.user.id);

  res.status(204).end();
});

router.put("/:brand/upvote", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists) return res.status(404).json({ message: "brand not found" });

  let upvote = await brand.upvote(req.user.id);

  res.status(200).json({ upvote });
});

router.put("/:brand/downvote", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists) return res.status(404).json({ message: "brand not found" });

  let downvote = await brand.downvote(req.user.id);

  res.status(200).json({ downvote });
});

router.delete("/:brand/unvote", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists) return res.status(404).json({ message: "brand not found" });

  let vote = await brand.isVoted(req.user.id);

  if (!vote) return res.status(404).json({ message: "brand not voted" });

  await brand.unvote(req.user.id);

  res.status(204).end();
});

router.post("/:brand/subscribe", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists) return res.status(404).json({ message: "brand not found" });

  let subscribe = await brand.isSubscribed(req.user.id);

  if (subscribe) return res.status(400).json({ message: "Already subscribed" });

  subscribe = await brand.subscribe(req.user.id);

  res.status(201).json({ subscribe });
});

router.delete("/:brand/unsubscribe", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists) return res.status(404).json({ message: "brand not found" });

  const subscription = await brand.isSubscribed(req.user.id);

  if (!subscription) return res.status(400).json({ message: "Not subscribed" });

  await brand.unsubscribe(subscription.id);

  res.status(200).end();
});

router.post("/:brand/comment", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  brandExists = await brand.find();

  if (!brandExists) return res.status(404).json({ message: "brand not found" });

  if (!req.body.content)
    return res.status(400).json({ message: "Comment required" });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res.status(400).json({ message: "Tags must be an array" });

  let commentData = {
    content: req.body.content,
    userId: req.user.id,
    entity: ENTITY,
    entityId: brand.id,
  };

  commentData.tags = req.body.tags.map((tag) =>
    tag
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "")
  );

  let comment = new Comment();
  comment = await comment.save(commentData);

  res.status(201).json({ comment });
});

router.post("/:brand/comment/:comment", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  brand = await brand.find();

  if (!brand) return res.status(404).json({ message: "brand not found" });

  if (!req.body.content || req.body.content == null)
    return res.status(400).json({ message: "Content required" });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res.status(400).json({ message: "Tags must be an array" });

  let commentData = {};
  commentData.tags = req.body.tags.map((tag) =>
    tag
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "")
  );

  let comment = new Comment();
  comment.id = req.params.comment;
  let commentExists = await comment.find();

  if (!commentExists)
    return res.status(402).json({ message: "Comment not found" });

  commentData = {
    content: req.body.content,
    userId: req.user.id,
    entity: ENTITY,
    entityId: brand.id,
  };

  comment = await comment.save(commentData);

  res.status(201).json({ comment });
});

router.get("/:brand/comments", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists) return res.status(404).json({ message: "No brand found" });

  let comments = new Comment();
  comments = await comments.findMany({ entityId: req.params.brand });

  res.status(200).json({ comments });
});

router.delete("/comment/:comment", async (req, res) => {
  let comment = new Comment();
  comment.id = req.params.comment;
  let commentExists = await comment.find();

  if (!commentExists)
    return res.status(404).json({ message: "Comment not found" });

  await comment.delete();

  res.status(204).end();
});

router.delete("/:brand", async (req, res) => {
  let brand = new Brand();
  brand.id = req.params.brand;
  let brandExists = await brand.find();

  if (!brandExists) return res.status(404).json({ message: "Brand not found" });

  if (brandExists.owner.id === req.user.id) brand.delete();

  res.status(204).end();
});

module.exports = router;
