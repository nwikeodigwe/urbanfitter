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
    // Should fix
    // where: {
    //   published: true,
    // },
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
      // Should fix
      // _count: {
      //   select: { likedBy: true },
      // },
      createdAt: true,
    },
  });

  if (!styles.length) return res.status(404).json({ error: "No style found" });

  res.status(200).json({ styles });
});

router.get("/me", [auth], async (req, res) => {
  const styles = await prisma.style.findMany({
    where: {
      author: { id: req.user.id },
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
      // Should fix
      // _count: {
      //   select: { likedBy: true },
      // },
      createdAt: true,
    },
  });

  if (!styles.length) return res.status(404).json({ error: "No style found" });

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
      // Should fix
      // _count: {
      //   select: { likedBy: true },
      // },
      createdAt: true,
    },
  });

  if (!style) return res.status(404).json({ error: "No style found" });

  res.status(200).json({ style });
});

// router.get(":style/user/:user", [auth], async (req, res) => {
//   const styles = await prisma.style.findMany({
//     where: {
//       id: req.params.style,
//       authorId: req.params.user,
//     },
//     select: {
//       id: true,
//       name: true,
//       description: true,
//       published: true,
//       tags: { select: { name: true } },
//       _count: {
//         select: { likedBy: true },
//       },
//       createdAt: true,
//     },
//   });

//   if (!styles) return res.status(404).json({ error: "No style found" });

//   res.status(200).json({ styles });
// });

router.post("/:style/comment", [auth], async (req, res) => {
  const entity = "STYLE";
  let { content, tags } = req.body;

  const style = await prisma.style.findUnique({
    where: { id: req.params.style },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  if (!content) return res.status(400).json({ error: "Comment required" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  const comment = await prisma.comment.create({
    data: {
      content,
      entity,
      entityId: req.params.style,
      ...(!!tags &&
        tags.length > 0 && {
          tag: {
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
  const entity = "STYLE";
  let { content, tags } = req.body;

  let style = await prisma.style.findUnique({
    where: { id: req.params.style },
  });

  if (!style) return res.status(404).json({ error: req.params.style });

  if (!content) return res.status(400).json({ error: "No comment provided" });

  if (tags && !Array.isArray(tags))
    return res.status(402).json({ error: "Tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  let comment = await prisma.comment.findUnique({
    where: {
      entity: entity,
      entityId: req.params.style,
      id: req.params.comment,
    },
  });

  if (!comment) return res.status(404).json({ error: "Comment not found" });

  comment = await prisma.comment.create({
    data: {
      content: content,
      ...(!!tags &&
        tags.length > 0 && {
          tag: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      authorId: req.user.id,
      entity: entity,
      entityId: req.params.style,
      parentId: req.params.comment,
    },
  });

  res.status(201).json({ comment });
});

router.get("/:style/comments", [auth], async (req, res) => {
  const entity = "STYLE";
  const comments = await prisma.comment.findMany({
    where: {
      entity: entity,
      entityId: req.params.style,
    },
    select: {
      id: true,
      content: true,
      entity: true,
      entityId: true,
      author: {
        select: {
          id: true,
          name: true,
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
  });

  if (comments.length < 1)
    return res.status(404).json({ error: "No comment found" });

  res.status(200).json({ comments });
});

router.delete("/comment/:comment", [auth], async (req, res) => {
  let comment = await prisma.comment.findFirst({
    where: { id: req.params.comment },
  });

  if (!comment) return res.status(404).json({ error: "Comment not found" });

  comment = await prisma.comment.delete({
    where: { id: req.params.comment, authorId: req.user.id },
  });

  res.status(204).end();
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

router.post("/:style/favorite", [auth], async (req, res) => {
  const style = await prisma.style.findFirst({
    where: {
      id: req.params.style,
    },
    select: {
      id: true,
    },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  const favorite = await prisma.favoriteStyle.upsert({
    where: {
      userId_styleId: {
        userId: req.user.id,
        styleId: style.id,
      },
    },
    create: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      style: {
        connect: {
          id: req.params.style,
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

router.delete("/:style/unfavorite", [auth], async (req, res) => {
  const style = await prisma.style.findFirst({
    where: {
      id: req.params.style,
    },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  let favorite = await prisma.favoriteStyle.findFirst({
    where: {
      userId: req.user.id,
      styleId: style.id,
    },
  });

  if (!favorite)
    return res.status(404).json({ error: "Style is not favorited" });

  await prisma.favoriteStyle.delete({
    where: {
      userId_styleId: {
        userId: favorite.userId,
        styleId: favorite.styleId,
      },
    },
  });

  res.status(204).end();
});

router.put("/:style/upvote", [auth], async (req, res) => {
  const style = await prisma.style.findFirst({
    where: {
      id: req.params.style,
    },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  const upvote = await prisma.styleVote.upsert({
    where: {
      userId_styleId: {
        styleId: req.params.style,
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
      style: {
        connect: {
          id: req.params.style,
        },
      },
      vote: 1,
    },
  });

  res.status(200).json({ upvote });
});

router.put("/:style/downvote", [auth], async (req, res) => {
  const style = await prisma.style.findFirst({
    where: {
      id: req.params.style,
    },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  const downvote = await prisma.styleVote.upsert({
    where: {
      userId_styleId: {
        styleId: req.params.style,
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
      style: {
        connect: {
          id: req.params.style,
        },
      },
      vote: -1,
    },
  });

  res.status(200).json({ downvote });
});

router.delete("/:style/unvote", [auth], async (req, res) => {
  const style = await prisma.style.findFirst({
    where: {
      id: req.params.style,
    },
  });

  if (!style) return res.status(404).json({ error: "Style not found" });

  const vote = await prisma.styleVote.findFirst({
    where: {
      styleId: style.id,
      userId: req.user.id,
    },
  });

  if (!vote) return res.status(404).json({ error: "Vote not found" });

  await prisma.styleVote.delete({
    where: {
      userId_styleId: {
        styleId: style.id,
        userId: req.user.id,
      },
    },
  });

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
  let style = await prisma.style.findFirst({
    where: { id: req.params.style },
  });

  if (!style) return res.status(404).json({ error: style });

  style = await prisma.style.delete({
    where: { id: req.params.style, authorId: req.user.id },
  });

  res.status(204).end();
});

module.exports = router;
