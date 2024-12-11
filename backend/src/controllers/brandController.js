const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createBrand = async (req, res) => {
  let { name, logo, owner, tags } = req.body;

  if (!name) return res.status(400).json({ error: "Name is required" });

  name = name
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 &]/g, "");

  if (owner) owner = owner.trim().toLowerCase();

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  if (tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  logo = await prisma.brand.findFirst({
    where: {
      logoId: logo,
    },
  });

  if (logo)
    return res
      .status(400)
      .json({ error: "No two brands can have the same logo" });

  logo = req.body.logo || undefined;

  let brand = await prisma.brand.findUnique({
    where: { name },
    select: {
      id: true,
    },
  });

  if (brand) return res.status(400).json({ error: "Brand already exists" });

  owner = await prisma.user.findFirst({
    where: {
      OR: [{ id: owner }, { name: owner }, { email: owner }],
    },
    select: {
      id: true,
    },
  });

  owner ? (owner = owner.id) : (owner = req.user.id);

  brand = await prisma.brand.create({
    data: {
      name,
      description: req.body.description.trim() || undefined,
      logo: {
        connect: {
          id: logo,
        },
      },
      owner: {
        connect: {
          id: owner,
        },
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
    },
    select: {
      id: true,
      name: true,
      logo: { select: { image: { select: { url: true } } } },
      owner: { select: { name: true } },
      tags: { select: { name: true } },
    },
  });

  res.status(201).json({ brand });
};

exports.getAllBrands = async (req, res) => {
  const brands = await prisma.brand.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      logo: { select: { image: { select: { url: true } } } },
      owner: { select: { name: true } },
      tags: { select: { name: true } },
      _count: {
        select: { items: true },
      },
    },
  });

  if (brands.length == 0)
    return res.status(404).json({ error: "No brand found" });

  res.status(200).json({ brands });
};

exports.getBrandById = async (req, res) => {
  const brand = await prisma.brand.findFirst({
    where: {
      id: req.params.brand,
    },
    select: {
      id: true,
      name: true,
      description: true,
      logo: { select: { image: { select: { url: true } } } },
      owner: { select: { name: true } },
      tags: { select: { name: true } },
      _count: {
        select: { items: true },
      },
    },
  });

  if (!brand) return res.status(404).json({ error: "Brand not found" });

  res.status(200).json({ brand });
};

exports.updateBrand = async (req, res) => {
  let { name, logo, description, owner, tags } = req.body;

  name = name
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 &]/g, "");

  let brand = await prisma.brand.findUnique({
    where: { id: req.params.brand },
  });

  if (!brand) return res.status(404).json({ error: "Brand not found" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  if (!!tags && tags.length > 0)
    tags = tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
    );

  owner ? (owner = owner.trim().toLowerCase()) : (owner = brand.ownerId);

  name = name || brand.name;
  description = description || brand.description;
  logo = logo || brand.logoId;

  owner = await prisma.user.findFirst({
    where: {
      OR: [{ id: owner }, { name: owner }, { email: owner }],
    },
    select: {
      id: true,
    },
  });

  if (!owner) return res.status(400).json({ error: "Owner is not a user" });

  owner = owner.id;

  brand = await prisma.brand.update({
    where: {
      id: req.params.brand,
      owner: { id: req.user.id },
    },
    data: {
      name,
      description,
      logo: {
        connect: {
          id: logo,
        },
      },
      owner: {
        connect: {
          id: owner,
        },
      },
      ...(tags &&
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
      logo: { select: { image: { select: { url: true } } } },
      owner: { select: { name: true } },
      tags: { select: { name: true } },
      _count: {
        select: { items: true },
      },
    },
  });

  res.status(200).json({ brand });
};

exports.favoriteBrand = async (req, res) => {
  const brand = await prisma.brand.findFirst({
    where: {
      id: req.params.brand,
    },
    select: {
      id: true,
    },
  });

  if (!brand) return res.status(404).json({ error: "brand not found" });

  const favorite = await prisma.favoriteBrand.upsert({
    where: {
      userId_brandId: {
        userId: req.user.id,
        brandId: brand.id,
      },
    },
    create: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      brand: {
        connect: {
          id: req.params.brand,
        },
      },
    },
    update: {},
    select: {
      id: true,
    },
  });

  res.status(201).json({ favorite });
};

exports.unfavoriteBrand = async (req, res) => {
  const brand = await prisma.brand.findFirst({
    where: {
      id: req.params.brand,
    },
  });

  if (!brand) return res.status(404).json({ error: "brand not found" });

  let favorite = await prisma.favoriteBrand.findFirst({
    where: {
      userId: req.user.id,
      brandId: brand.id,
    },
  });

  if (!favorite)
    return res.status(404).json({ error: "brand is not favorited" });

  await prisma.favoriteBrand.delete({
    where: {
      userId_brandId: {
        userId: favorite.userId,
        brandId: favorite.brandId,
      },
    },
  });

  res.status(204).end();
};

exports.upvoteBrand = async (req, res) => {
  const brand = await prisma.brand.findFirst({
    where: {
      id: req.params.brand,
    },
  });

  if (!brand) return res.status(404).json({ error: "brand not found" });

  const upvote = await prisma.brandVote.upsert({
    where: {
      userId_brandId: { brandId: req.params.brand, userId: req.user.id },
    },
    update: {
      vote: true,
    },
    create: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      brand: {
        connect: {
          id: req.params.brand,
        },
      },
      vote: true,
    },
  });

  res.status(200).json({ upvote });
};

exports.downvoteBrand = async (req, res) => {
  const brand = await prisma.brand.findFirst({
    where: {
      id: req.params.brand,
    },
  });

  if (!brand) return res.status(404).json({ error: "brand not found" });

  const downvote = await prisma.brandVote.upsert({
    where: {
      userId_brandId: { brandId: req.params.brand, userId: req.user.id },
    },
    update: {
      vote: false,
    },
    create: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      brand: {
        connect: {
          id: req.params.brand,
        },
      },
      vote: false,
    },
  });

  res.status(200).json({ downvote });
};

exports.unvoteBrand = async (req, res) => {
  const brand = await prisma.brand.findFirst({
    where: {
      id: req.params.brand,
    },
  });

  if (!brand) return res.status(404).json({ error: "brand not found" });

  const vote = await prisma.brandVote.findFirst({
    where: {
      brandId: req.params.brand,
      userId: req.user.id,
    },
  });

  if (!vote) return res.status(404).json({ error: "brand not voted" });

  await prisma.brandVote.delete({
    where: {
      userId_brandId: { brandId: req.params.brand, userId: req.user.id },
    },
  });

  res.status(204).end();
};

exports.subscribeToBrand = async (req, res) => {
  const brand = await prisma.brand.findFirst({
    where: {
      OR: [{ id: req.params.brand }, { name: req.params.brand }],
    },
    select: {
      id: true,
    },
  });

  if (!brand) return res.status(404).json({ error: "brand not found" });

  let subscription = await prisma.brandSubscription.findFirst({
    where: {
      brandId: brand.id,
      userId: req.user.id,
    },
  });

  if (subscription)
    return res.status(400).json({ error: "Already subscribed" });

  subscription = await prisma.brandSubscription.create({
    data: {
      user: {
        connect: {
          id: req.user.id,
        },
      },
      brand: {
        connect: {
          id: brand.id,
        },
      },
    },
    select: {
      id: true,
    },
  });

  res.status(201).json({ subscription });
};

exports.unsubscribeFromBrand = async (req, res) => {
  const brand = await prisma.brand.findFirst({
    where: {
      OR: [{ id: req.params.brand }, { name: req.params.brand }],
    },
    select: {
      id: true,
    },
  });

  if (!brand) return res.status(404).json({ error: "brand not found" });

  const subscription = await prisma.brandSubscription.findFirst({
    where: {
      brandId: brand.id,
      userId: req.user.id,
    },
  });

  if (!subscription) return res.status(400).json({ error: "Not subscribed" });

  await prisma.brandSubscription.delete({
    where: {
      id: subscription.id,
    },
  });

  res.status(200).end();
};

exports.commentOnBrand = async (req, res) => {
  let { content, tags } = req.body;

  const brand = await prisma.brand.findUnique({
    where: { id: req.params.brand },
  });

  if (!brand) return res.status(404).json({ error: "brand not found" });

  if (!content) return res.status(400).json({ error: "Comment required" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  tags = tags.map((tag) =>
    tag
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "")
  );

  let entity = "BRAND";

  const comment = await prisma.comment.create({
    data: {
      content,
      ...(tags.length > 0 && {
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
      entity,
      entityId: req.params.brand,
    },
  });

  res.status(201).json({ comment });
};

exports.commentOnComment = async (req, res) => {
  let { content, tags } = req.body;

  let brand = await prisma.brand.findUnique({
    where: { id: req.params.brand },
  });

  if (!brand) return res.status(404).json({ error: "brand not found" });

  if (!content || content == null)
    return res.status(400).json({ error: "Content required" });

  if (tags && !Array.isArray(tags))
    return res.status(400).json({ error: "Tags must be an array" });

  tags = tags.map((tag) =>
    tag
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "")
  );

  let comment = await prisma.comment.findUnique({
    where: { id: req.params.comment },
  });

  if (!comment) return res.status(402).json({ error: "Comment not found" });

  comment = await prisma.comment.create({
    data: {
      content,
      ...(tags.length > 0 && {
        tag: {
          connectOrCreate: tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      }),
      authorId: req.user.id,
      entity: "BRAND",
      entityId: req.params.brand,
      parentId: req.params.comment,
    },
  });

  res.status(200).json({ comment });
};

exports.getBrandComment = async (req, res) => {
  const brand = await prisma.brand.findFirst({
    where: {
      id: req.params.brand,
    },
  });

  if (!brand) return res.status(404).json({ error: "No brand found" });

  const comments = await prisma.comment.findMany({
    where: {
      id: req.params.brand,
    },
  });

  res.status(200).json({ comments });
};

exports.deleteComment = async (req, res) => {
  let comment = await prisma.comment.findFirst({
    where: {
      id: req.params.comment,
    },
  });

  if (!comment) return res.status(404).json({ error: "Comment not found" });

  comment = await prisma.comment.delete({
    where: { id: req.params.comment, authorId: req.user.id },
  });

  res.status(204).end();
};

exports.deleteBrand = async (req, res) => {
  let brand = await prisma.brand.findFirst({
    where: {
      id: req.params.brand,
      owner: {
        id: req.user.id,
      },
    },
  });

  if (!brand) return res.status(404).json({ error: "Brand not found" });

  await prisma.brand.delete({
    where: {
      id: req.params.brand,
    },
  });

  res.status(204).end();
};
