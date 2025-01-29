const express = require("express");
const Style = require("../utils/Style");
const Collection = require("../utils/Collection");
const Comment = require("../utils/Comment");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();
const ENTITY = "STYLE";

router.post("/", async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(400)
      .json({ message: "name and description is required" });

  let collection = new Collection();
  collection.id = req.body.collection;
  let collectionExists = await collection.find();

  if (!collectionExists)
    return res.status(404).json({ message: "Collection not found" });

  if (!!req.body.tags && !Array.isArray(req.body.tags))
    return res.status(400).json({ message: "Tags must be an array" });

  let styleData = { ...req.body };
  styleData.author = req.user.id;

  if (req.body.tags && req.body.tags.length > 0)
    styleData.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  let style = new Style();
  style = await style.save(styleData);

  res.status(201).json({ style });
});

router.get("/", async (req, res) => {
  let styles = new Style();
  styles = await styles.findMany();

  if (!styles.length)
    return res.status(404).json({ message: "No style found" });

  res.status(200).json({ styles });
});

router.get("/me", async (req, res) => {
  let styles = new Style();
  styles = await styles.findMany({ authorId: req.user.id });

  if (!styles.length)
    return res.status(404).json({ message: "No style found" });

  res.status(200).json({ styles });
});

router.get("/:style", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  style = await style.find();

  if (!style) return res.status(404).json({ message: "No style found" });

  res.status(200).json({ style });
});

router.post("/:style/comment", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists) return res.status(404).json({ message: "Style not found" });

  if (!req.body.content)
    return res.status(400).json({ message: "Comment required" });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res.status(400).json({ message: "Tags must be an array" });

  let commentData = { ...req.body };
  commentData.entity = ENTITY;
  commentData.entityId = req.params.style;
  commentData.userId = req.user.id;

  if (req.body.tags && req.body.tags.length > 0)
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

router.post("/:style/comment/:comment", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists) return res.status(404).json({ message: req.params.style });

  if (!req.body.content)
    return res.status(400).json({ message: "No comment provided" });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res.status(402).json({ message: "Tags must be an array" });

  let commentData = { ...req.body };
  commentData.entity = ENTITY;
  commentData.entityId = req.params.style;
  commentData.userId = req.user.id;

  if (req.body.tags && req.body.tags.length > 0)
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
    return res.status(404).json({ message: "Comment not found" });

  comment = await comment.save(commentData);

  res.status(201).json({ comment });
});

router.get("/:style/comments", async (req, res) => {
  let comments = new Comment();
  comments = await comments.findMany({ entityId: req.params.style });

  if (comments.length < 1)
    return res.status(404).json({ message: "No comment found" });

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

router.patch("/:style", async (req, res) => {
  let { name, description, items, tags } = req.body;

  if (!req.body.name && !req.body.description)
    return res
      .status(400)
      .json({ message: "Name and description is required" });

  if (req.body.items && !Array.isArray(req.body.items))
    return res.status(400).json({ message: "Items must be an array" });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res.status(400).json({ message: "Tags must be an array" });

  let styleData = { ...req.body };

  styleData.tags = req.body.tags
    .map((tag) => tag.trim().toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "");

  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists) return res.status(404).json({ message: "Style not found" });

  style = await style.save(styleData);

  res.status(200).json({ style });
});

router.post("/:style/favorite", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists) return res.status(404).json({ message: "Style not found" });

  const favorite = await style.favorite(req.user.id);

  res.status(201).json({ favorite });
});

router.delete("/:style/unfavorite", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists) return res.status(404).json({ message: "Style not found" });

  let favorite = await style.isFavorited(req.user.id);

  if (!favorite)
    return res.status(404).json({ message: "Style is not favorited" });

  await style.unfavorite(req.user.id);

  res.status(204).end();
});

router.put("/:style/upvote", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists) return res.status(404).json({ message: "Style not found" });

  const upvote = await style.upvote(req.user.id);

  res.status(200).json({ upvote });
});

router.put("/:style/downvote", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists) return res.status(404).json({ message: "Style not found" });

  const downvote = await style.downvote(req.user.id);

  res.status(200).json({ downvote });
});

router.delete("/:style/unvote", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists) return res.status(404).json({ message: "Style not found" });

  const vote = await style.isVoted(req.user.id);

  if (!vote) return res.status(404).json({ message: "Vote not found" });

  await style.unvote(req.user.id);

  res.status(204).end();
});

router.patch("/:style/publish", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists) return res.status(404).json({ message: "Style not found" });

  style = await style.save({ published: true });

  res.status(200).json({ style });
});

router.patch("/:style/unpublish", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists) return res.status(404).json({ message: "Style not found" });

  style = await style.save({ published: false });

  res.status(200).json({ style });
});

router.delete("/:style", async (req, res) => {
  let style = new Style();
  style.id = req.params.style;
  let styleExists = await style.find();

  if (!styleExists) return res.status(404).json({ message: style });

  await style.delete();

  res.status(204).end();
});

module.exports = router;
