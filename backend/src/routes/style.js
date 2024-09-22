const express = require("express");
const auth = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", [auth], async (req, res) => {
  let { name, description, collection } = req.body;

  if (!name || !description)
    return res.status(400).json({ error: "name and description is required" });

  const styleData = {
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
  };

  collection = await prisma.collection.findUnique({
    where: { id: collection },
    select: { id: true },
  });

  if (!collection)
    return res.status(404).json({ error: "Collection not found" });

  const style = await prisma.style.create({
    data: {
      ...styleData,
      collection: {
        connect: {
          id: collection.id,
        },
      },
      author: {
        connect: {
          id: req.user.id,
        },
      },
    },
  });

  res.status(201).json({ style });
});

router.get("/", [auth], async (req, res) => {
  const styles = await prisma.style.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      collection: {
        select: {
          name: true,
        },
      },
      _count: {
        select: { likedBy: true },
      },
      createdAt: true,
    },
  });

  if (!styles) return res.status(404).json({ error: "No style found" });

  res.status(200).json({ styles });
});

router.get("/:style", [auth], async (req, res) => {
  const style = await prisma.style.findUnique({
    where: {
      id: req.params.style,
    },
    select: {
      id: true,
      name: true,
      description: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      items: true,
      collection: {
        select: {
          name: true,
        },
      },
      _count: {
        select: { likedBy: true },
      },
      createdAt: true,
    },
  });

  if (!style) return res.status(404).json({ error: "No style found" });

  res.status(200).json({ style });
});

router.get("/me", [auth], async (req, res) => {
  const styles = await prisma.style.findMany({
    where: {
      authorId: req.user.id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      published: true,
      _count: {
        select: { likedBy: true },
      },
      collection: {
        select: {
          name: true,
        },
      },
      createdAt: true,
    },
  });

  if (!styles) return res.status(404).json({ error: "Posts not found" });

  res.status(200).json({ styles });
});

router.get(":style/user/:user", [auth], async (req, res) => {
  const styles = await prisma.style.findMany({
    where: {
      id: req.params.style,
      authorId: req.params.user,
    },
    select: {
      id: true,
      name: true,
      description: true,
      published: true,
      _count: {
        select: { likedBy: true },
      },
      createdAt: true,
    },
  });

  if (!styles) return res.status(404).json({ error: "No style found" });

  res.status(200).json({ styles });
});

router.post("/:style/comment", [auth], async (req, res) => {
  const { content } = req.body;

  if (!content) return res.status(400).json({ error: "Comment required" });

  const style = await prisma.style.findUnique({
    where: { id: req.params.style },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  const comment = await prisma.comment.create({
    data: {
      content,
      style: {
        connect: {
          id: req.params.style,
        },
      },
      author: {
        connect: {
          id: req.user.id,
        },
      },
    },
  });

  res.status(201).json({ comment });
});

router.post("/:style/comment/:comment", [auth], async (req, res) => {
  const { content } = req.body;

  if (!content) return res.status(400).json({ error: "Content required" });

  let style = await prisma.style.findUnique({
    where: { id: req.params.style },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  let comment = await prisma.comment.findUnique({
    where: { id: req.params.comment },
  });

  if (!comment) return res.status(404).json({ error: "Comment not found" });

  comment = await prisma.comment.create({
    data: {
      content: content,
      authorId: req.user.id,
      styleId: req.params.style,
      parentId: req.params.comment,
    },
  });

  res.status(200).json({ comment });
});

router.get("/:style/comments", [auth], async (req, res) => {
  const styles = await prisma.style.findMany({
    where: {
      id: req.params.style,
    },
    select: {
      comments: {
        select: {
          id: true,
          content: true,
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              likedBy: true,
            },
          },
          replies: {
            select: {
              id: true,
              content: true,
              author: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!styles) return res.status(404).json({ error: "No style found" });

  res.status(200).json({ styles });
});

router.patch("/:style", [auth], async (req, res) => {
  const { name, description, items } = req.body;

  if (!name && !description)
    return res.status(400).json({ error: "name and description is required" });

  if (items && !Array.isArray(items))
    return res.status(400).json({ error: "Items must be an array" });

  const style = await prisma.style.update({
    where: { id: req.params.style, authorId: req.user.id },
    data: {
      name,
      description,
      items: {
        deleteMany: {},
        create: items.map((itemId) => ({
          items: { connect: { id: itemId } },
        })),
      },
    },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  res.status(200).json({ style });
});

router.delete("/comment/:comment", [auth], async (req, res) => {
  const comment = await prisma.comment.delete({
    where: { id: req.params.comment, authorId: req.user.id },
  });

  if (!comment) return res.status(404).json({ error: "Comment not found" });

  res.status(204).end();
});

router.post("/:style/like", [auth], async (req, res) => {
  const like = await prisma.likedStyle.create({
    data: {
      style: { connect: { id: req.params.style } },
      user: { connect: { id: req.user.id } },
    },
  });

  res.status(201).json({ like });
});

router.delete("/:style/unlike", [auth], async (req, res) => {
  const like = await prisma.likedStyle.delete({
    where: {
      userId_styleId: {
        userId: req.user.id,
        styleId: req.params.style,
      },
    },
  });

  if (!like) return res.status(404).json({ error: "Like not found" });

  res.status(204).end();
});

router.patch("/:style/publish", [auth], async (req, res) => {
  const style = await prisma.style.update({
    where: { id: req.params.style, authorId: req.user.id },
    data: { published: true },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  res.status(200).json({ style });
});

router.patch("/:style/unpublish", [auth], async (req, res) => {
  const style = await prisma.style.update({
    where: { id: req.params.style, authorId: req.user.id },
    data: { published: false },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  res.status(200).json({ style });
});

router.delete("/:style", [auth], async (req, res) => {
  const style = await prisma.style.delete({
    where: { id: req.params.style, authorId: req.user.id },
  });

  if (!style) return res.status(404).json({ error: "Post not found" });

  res.status(204).end();
});

module.exports = router;
