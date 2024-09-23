const express = require("express");
const auth = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", [auth], async (req, res) => {
  let { name, description, collection, tags } = req.body;

  if (!name || !description)
    return res.status(400).json({ error: "name and description is required" });

  collection = await prisma.collection.findUnique({
    where: { id: collection },
    select: { id: true },
  });

  if (!collection)
    return res.status(404).json({ error: "Collection not found" });

  if (!!tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  const style = await prisma.style.create({
    data: {
      name: name || undefined,
      description: description || undefined,
      ...(!!tags &&
        tags.length > 0 && {
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
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
    select: {
      id: true,
      name: true,
      description: true,
      tags: { select: { name: true } },
      collection: {
        select: {
          name: true,
        },
      },
      author: {
        select: { name: true },
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
      tags: { select: { name: true } },
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
      tags: { select: { name: true } },
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
      tags: { select: { name: true } },
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
      tags: { select: { name: true } },
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
  let { content, tags } = req.body;

  if (!content) return res.status(400).json({ error: "Comment required" });

  const style = await prisma.style.findUnique({
    where: { id: req.params.style },
  });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  tags = tags
    .map((tag) => tag.trim().toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "");

  if (!style) return res.status(404).json({ error: "Style not found" });

  const comment = await prisma.comment.create({
    data: {
      content,
      style: {
        connect: {
          id: req.params.style,
        },
      },
      ...(tags.length > 0 && {
        tags: {
          set: [],
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      }),
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
  let { content, tags } = req.body;

  if (!content) return res.status(400).json({ error: "Content required" });

  let style = await prisma.style.findUnique({
    where: { id: req.params.style },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  tags = tags
    .map((tag) => tag.trim().toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "");

  let comment = await prisma.comment.findUnique({
    where: { id: req.params.comment },
  });

  if (!comment) return res.status(404).json({ error: "Comment not found" });

  comment = await prisma.comment.create({
    data: {
      content: content,
      ...(tags.length > 0 && {
        tags: {
          set: [],
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      }),
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
  let { name, description, items, tags } = req.body;

  if (!name && !description)
    return res.status(400).json({ error: "Name and description is required" });

  if (items && !Array.isArray(items))
    return res.status(400).json({ error: "Items must be an array" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  tags = tags
    .map((tag) => tag.trim().toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "");

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
      ...(tags.length > 0 && {
        tags: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      }),
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
