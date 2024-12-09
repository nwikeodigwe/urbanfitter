const express = require("express");
const auth = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

router.post("/", [auth], async (req, res) => {
  let { name, description, brand, images, creator, tags } = req.body;

  if (!name || !description)
    return res.status(400).json({ error: "Name and description is required" });

  if (!Array.isArray(images) || images.length === 0)
    return res.status(400).json({ error: "At least one image is required" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  if (tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  if (!brand) return res.status(400).json({ error: "Brand is required" });

  brand = brand
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "");

  creator = await prisma.user.findFirst({
    where: {
      OR: [{ id: creator }, { name: creator }, { email: creator }],
    },
    select: {
      id: true,
    },
  });

  creator ? (creator = creator.id) : (creator = req.user.id);

  const item = await prisma.item.create({
    data: {
      name,
      description,
      brand: {
        connectOrCreate: {
          where: { name: brand },
          create: { name: brand },
        },
      },
      images: {
        connect: images.map((image) => ({
          id: image,
        })),
      },
      ...(tags &&
        tags.length > 0 && {
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      creator: {
        connect: {
          id: creator,
        },
      },
    },
    include: {
      tags: { select: { name: true } },
      images: { select: { url: true } },
      brand: { select: { name: true } },
    },
  });

  res.status(201).json({ item });
});

router.get("/", [auth], async (req, res) => {
  const items = await prisma.item.findMany({
    //where: {
    // Should fix
    //   published: true,
    //},
    select: {
      id: true,
      name: true,
      description: true,
      images: { select: { url: true } },
      tags: { select: { name: true } },
      brand: { select: { name: true } },
      creator: { select: { name: true } },
      // Should fix
      // _count: {
      //   select: {
      //     likedBy: true,
      //   },
      // },
      createdAt: true,
    },
  });

  if (!items.length) return res.status(404).json({ error: "No item found" });

  res.status(200).json({ items });
});

router.get("/:item", [auth], async (req, res) => {
  const item = await prisma.item.findUnique({
    where: {
      id: req.params.item,
    },
    select: {
      id: true,
      name: true,
      description: true,
      images: { select: { url: true } },
      tags: { select: { name: true } },
      brand: { select: { name: true } },
      styles: true,
      // Should fix
      // _count: {
      //   select: {
      //     likedBy: true,
      //   },
      // },
      createdAt: true,
    },
  });

  if (!item) return res.status(404).json({ error: "Item not found" });

  res.status(200).json({ item });
});

router.post("/:item/favorite", [auth], async (req, res) => {
  const item = await prisma.item.findFirst({
    where: {
      id: req.params.item,
    },
    select: {
      id: true,
    },
  });

  if (!item) return res.status(404).json({ error: "item not found" });

  const favorite = await prisma.favoriteItem.upsert({
    where: {
      userId_itemId: {
        userId: req.user.id,
        itemId: item.id,
      },
    },
    create: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      item: {
        connect: {
          id: req.params.item,
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

router.delete("/:item/unfavorite", [auth], async (req, res) => {
  const item = await prisma.item.findFirst({
    where: {
      id: req.params.item,
    },
  });

  if (!item) return res.status(404).json({ error: "item not found" });

  let favorite = await prisma.favoriteItem.findFirst({
    where: {
      userId: req.user.id,
      itemId: item.id,
    },
  });

  if (!favorite)
    return res.status(400).json({ error: "item is not favorited" });

  await prisma.favoriteItem.delete({
    where: {
      userId_itemId: {
        userId: favorite.userId,
        itemId: favorite.itemId,
      },
    },
  });

  res.status(204).end();
});

router.put("/:item/upvote", [auth], async (req, res) => {
  const item = await prisma.item.findFirst({
    where: {
      id: req.params.item,
    },
  });

  if (!item) return res.status(404).json({ error: "Item not found" });

  const upvote = await prisma.itemVote.upsert({
    where: {
      userId_itemId: { itemId: req.params.item, userId: req.user.id },
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
      item: {
        connect: {
          id: req.params.item,
        },
      },
      vote: 1,
    },
  });

  res.status(200).json({ upvote });
});

router.put("/:item/downvote", [auth], async (req, res) => {
  const item = await prisma.item.findFirst({
    where: {
      id: req.params.item,
    },
  });

  if (!item) return res.status(404).json({ error: "Item not found" });

  const downvote = await prisma.itemVote.upsert({
    where: {
      userId_itemId: { itemId: req.params.item, userId: req.user.id },
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
      item: {
        connect: {
          id: req.params.item,
        },
      },
      vote: -1,
    },
  });

  res.status(200).json({ downvote });
});

router.delete("/:item/unvote", [auth], async (req, res) => {
  const item = await prisma.item.findFirst({
    where: {
      id: req.params.item,
    },
  });

  if (!item) return res.status(404).json({ error: "Item not found" });

  await prisma.itemVote.delete({
    where: {
      userId_itemId: { itemId: req.params.item, userId: req.user.id },
    },
  });

  res.status(204).end();
});

router.patch("/:item", [auth], async (req, res) => {
  let { name, description, images, tags, creator } = req.body;

  if (images && (!Array.isArray(images) || images.length === 0))
    return res.status(400).json({ error: "At least one image is required" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  let item = await prisma.item.findFirst({
    where: {
      id: req.params.id,
    },
    select: {
      name: true,
      description: true,
      images: true,
      creator: true,
    },
  });

  if (!item) return res.status(404).json({ error: "Item not found" });

  // if (creator) {
  //   creator = await prisma.user.findFirst({
  //     where: { OR: [{ id: creator }, { name: creator }, { email: creator }] },
  //     select: { id: true },
  //   });
  //   creator = creator.id || undefined;
  // }

  name = name || item.name;
  description = description || item.description;
  images = images || item.images;
  creator = creator || item.creator.id;

  item = await prisma.item.update({
    where: {
      id: req.params.item,
      creator: { id: req.user.id },
    },
    data: {
      name,
      description,
      //Should fix
      // images: {
      //   deleteMany: {},
      //   connect: images.map((image) => ({
      //     id: image,
      //   })),
      // },
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
      ...(creator && {
        creator: {
          connect: {
            id: creator,
          },
        },
      }),
    },
    include: {
      images: { select: { url: true } },
      tags: { select: { name: true } },
      brand: { select: { name: true } },
    },
  });

  res.status(200).json({ item });
});

router.delete("/:item", [auth], async (req, res) => {
  let item = await prisma.item.findFirst({
    where: {
      id: req.params.item,
      creator: { id: req.user.id },
    },
  });

  if (!item) return res.status(404).json({ error: "Item not found" });

  await prisma.item.delete({
    where: {
      id: item.id,
    },
  });

  res.status(204).end();
});

module.exports = router;
