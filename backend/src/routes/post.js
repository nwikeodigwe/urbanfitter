const express = require("express");
const auth = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const { connect } = require("http2");
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", [auth], async (req, res) => {
  const { title, content, categoryId } = req.body;

  if (!title || !content)
    return res.status(400).json({ error: "Title and content required" });

  const post = await prisma.post.create({
    data: {
      title,
      content,
      published: false,
      category: {
        connect: {
          id: req.body.categoryId,
        },
      },
    },
  });

  res.status(201).json({ post });
});

router.get("/", [auth], async (req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      title: true,
      content: true,
      category: true,
      published: true,
      createdAt: true,
    },
  });

  if (!posts) return res.status(404).json({ error: "Posts not found" });

  res.status(200).json({ posts });
});

router.get("/me", [auth], async (req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      authorId: req.user.id,
    },
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      createdAt: true,
    },
  });

  if (!posts) return res.status(404).json({ error: "Posts not found" });

  res.status(200).json({ posts });
});

router.get("/:category", [auth], async (req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      categoryId: req.params.category,
    },
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      createdAt: true,
    },
  });

  if (!posts) return res.status(404).json({ error: "Posts not found" });

  res.status(200).json({ posts });
});

router.get("/:post", [auth], async (req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      id: req.params.post,
      authorId: req.user.id,
    },
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      createdAt: true,
    },
  });

  if (!posts) return res.status(404).json({ error: "Post not found" });

  res.status(200).json({ posts });
});

router.post("/:post/comment", [auth], async (req, res) => {
  const { content } = req.body;

  if (!content) return res.status(400).json({ error: "Content required" });

  const comment = await prisma.comment.create({
    data: {
      content,
      connect: {
        post: {
          id: req.params.post,
        },
        user: {
          id: req.user.id,
        },
      },
    },
  });

  res.status(201).json({ comment });
});

router.post("/:post/comment/:comment", [auth], async (req, res) => {
  const { content } = req.body;

  if (!content) return res.status(400).json({ error: "Content required" });

  const comment = await prisma.comment.create({
    data: {
      content: content,
      authorId: req.user.id,
      postId: req.params.post,
      parentId: req.params.comment,
    },
  });

  res.status(200).json({ comment });
});

router.get("/:post/commments/", [auth], async (req, res) => {
  const posts = await prisma.post.findMany({
    where: {
      id: req.params.post,
    },
    select: {
      comments: true,
      replies: true,
    },
  });

  if (!posts) return res.status(404).json({ error: "Post not found" });

  res.status(200).json({ posts });
});

router.patch("/:post", [auth], async (req, res) => {
  const { title, content } = req.body;

  if (!title && !content)
    return res.status(400).json({ error: "Title or content required" });

  const post = await prisma.post.update({
    where: { id: req.params.post, authorId: req.user.id },
    select: { id: true },
  });

  if (!post) return res.status(404).json({ error: "Post not found" });

  res.status(200).json({ post });
});

router.delete("/:comment", [auth], async (req, res) => {
  const comment = await prisma.comment.delete({
    where: { id: req.params.comment, authorId: req.user.id },
  });

  if (!comment) return res.status(404).json({ error: "Comment not found" });

  res.status(200).json({ comment });
});

router.post("/:post/like", [auth], async (req, res) => {
  const like = await prisma.like.create({
    data: {
      post: { connect: { id: req.params.post } },
      user: { connect: { id: req.user.id } },
    },
  });

  res.status(201).json({ like });
});

router.delete("/:post/unlike", [auth], async (req, res) => {
  const comment = await prisma.like.delete({
    where: { postId: req.params.post, authorId: req.user.id },
  });

  if (!comment) return res.status(404).json({ error: "Post not found" });

  res.status(200).json({ comment });
});

router.get("/:post/likes", [auth], async (req, res) => {
  const like = await prisma.like.findMany({
    where: { postId: req.params.post },
  });

  res.status(201).json({ like });
});

router.patch("/:post/publish", [auth], async (req, res) => {
  const post = await prisma.post.update({
    where: { id: req.params.post, authorId: req.user.id },
    data: { published: true },
  });

  if (!post) return res.status(404).json({ error: "Post not found" });

  res.status(200).json({ post });
});

router.delete("/:post", [auth], async (req, res) => {
  const post = await prisma.post.delete({
    where: { id: req.params.post, authorId: req.user.id },
  });

  if (!post) return res.status(404).json({ error: "Post not found" });

  res.status(200).json({ post });
});

module.exports = router;
