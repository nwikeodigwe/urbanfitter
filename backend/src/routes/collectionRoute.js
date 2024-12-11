const express = require("express");
const auth = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", [auth], async (req, res) => {
  let { name, description, tags } = req.body;

  if (!name || !description)
    return res.status(400).json({ error: "name and description is required" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  const collection = await prisma.collection.create({
    data: {
      name,
      description,
      author: {
        connect: {
          id: req.user.id,
        },
      },
      ...(!!tags &&
        tags.length > 0 && {
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      tags: { select: { name: true } },
      author: {
        select: { name: true },
      },
      createdAt: true,
    },
  });

  res.status(201).json({ collection });
});

router.get("/", [auth], async (req, res) => {
  const collections = await prisma.collection.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      author: {
        select: { name: true },
      },
      tags: {
        select: { name: true },
      },
    },
  });

  if (!collections.length)
    return res.status(404).json({ error: "No collection found" });

  res.status(200).json({ collections });
});

router.get("/:collection", [auth], async (req, res) => {
  const collection = await prisma.collection.findFirst({
    where: {
      id: req.params.collection,
    },
    select: {
      id: true,
      name: true,
      description: true,
      author: {
        select: { name: true },
      },
      tags: {
        select: { name: true },
      },
    },
  });

  if (!collection)
    return res.status(404).json({ error: "Collection not found" });

  res.status(200).json({ collection });
});

router.get("/:collection/styles", [auth], async (req, res) => {
  const styles = await prisma.style.findMany({
    where: {
      collectionId: req.params.collection,
    },
    select: {
      id: true,
      name: true,
      description: true,
      published: true,
      tags: {
        select: { name: true },
      },
      createdAt: true,
    },
  });

  if (!styles.length) return res.status(404).json({ error: "No style found" });

  res.status(200).json({ styles });
});

router.post("/:collection/favorite", [auth], async (req, res) => {
  const collection = await prisma.collection.findFirst({
    where: {
      id: req.params.collection,
    },
    select: {
      id: true,
    },
  });

  if (!collection)
    return res.status(404).json({ error: "Collection not found" });

  const favorite = await prisma.favoriteCollection.upsert({
    where: {
      userId_collectionId: {
        userId: req.user.id,
        collectionId: collection.id,
      },
    },
    create: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      collection: {
        connect: {
          id: req.params.collection,
        },
      },
    },
    update: {},
    select: {
      id: true,
    },
  });

  res.status(201).json({ favorite });
});

router.delete("/:collection/unfavorite", [auth], async (req, res) => {
  const collection = await prisma.collection.findFirst({
    where: {
      id: req.params.collection,
    },
  });

  if (!collection)
    return res.status(404).json({ error: "Collection not found" });

  let favorite = await prisma.favoriteCollection.findFirst({
    where: {
      userId: req.user.id,
      collectionId: req.params.collection,
    },
  });

  if (!favorite)
    return res.status(404).json({ error: "Collection is not favorited" });

  await prisma.favoriteCollection.delete({
    where: {
      userId_collectionId: {
        userId: favorite.userId,
        collectionId: favorite.collectionId,
      },
    },
  });

  res.status(204).end();
});

router.put("/:collection/upvote", [auth], async (req, res) => {
  const collection = await prisma.collection.findFirst({
    where: {
      id: req.params.collection,
    },
  });

  if (!collection)
    return res.status(404).json({ error: "Collection not found" });

  const upvote = await prisma.collectionVote.upsert({
    where: {
      userId_collectionId: {
        collectionId: req.params.collection,
        userId: req.user.id,
      },
    },
    update: {
      vote: 1,
    },
    create: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      collection: {
        connect: {
          id: req.params.collection,
        },
      },
      vote: 1,
    },
  });

  res.status(200).json({ upvote });
});

router.put("/:collection/downvote", [auth], async (req, res) => {
  const collection = await prisma.collection.findFirst({
    where: {
      id: req.params.collection,
    },
  });

  if (!collection)
    return res.status(404).json({ error: "collection not found" });

  const downvote = await prisma.collectionVote.upsert({
    where: {
      userId_collectionId: {
        collectionId: req.params.collection,
        userId: req.user.id,
      },
    },
    update: {
      vote: -1,
    },
    create: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      collection: {
        connect: {
          id: req.params.collection,
        },
      },
      vote: -1,
    },
  });

  res.status(200).json({ downvote });
});

router.delete("/:collection/unvote", [auth], async (req, res) => {
  const collection = await prisma.collection.findFirst({
    where: {
      id: req.params.collection,
    },
  });

  if (!collection)
    return res.status(404).json({ error: "Collection not found" });

  const vote = await prisma.collectionVote.findFirst({
    where: {
      collectionId: collection.id,
      userId: req.user.id,
    },
  });

  if (!vote) return res.status(404).json({ error: "Vote not found" });

  await prisma.collectionVote.delete({
    where: {
      userId_collectionId: {
        collectionId: collection.id,
        userId: req.user.id,
      },
    },
  });

  res.status(204).end();
});

router.patch("/:collection", [auth], async (req, res) => {
  let { name, description, tags } = req.body;

  let collection = await prisma.collection.findFirst({
    where: { id: req.params.collection, authorId: req.user.id },
    select: { id: true },
  });

  if (!collection)
    return res.status(404).json({ error: "Collection not found" });

  if (!!tags && !Array.isArray(tags))
    return res.status(400).json({ error: "tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  name = name.trim() || collection.name;
  description = description.trim() || collection.description;
  tags = tags || collection.tags || [];

  collection = await prisma.collection.update({
    where: { id: req.params.collection, authorId: req.user.id },
    data: {
      name,
      description,
      ...(!!tags &&
        tags.length > 0 && {
          tags: {
            set: [],
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      tags: { select: { name: true } },
      author: {
        select: { name: true },
      },
      updatedAt: true,
    },
  });

  res.status(200).json({ collection });
});

router.delete("/:collection", [auth], async (req, res) => {
  let collection = await prisma.collection.findFirst({
    where: {
      id: req.params.collection,
    },
  });

  if (!collection)
    return res.status(404).json({ error: "Collection not found" });

  await prisma.collection.delete({
    where: { id: req.params.collection, authorId: req.user.id },
  });

  res.status(204).end();
});

module.exports = router;
