const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class Brand {
  constructor(brand = {}) {
    this.id = brand.id || null;
    this.name = brand.name || null;
    this.description = brand.description || null;
    this.tags = brand.tags || [];
    this.brandId = brand.brandId || null;
    this.owner = brand.owner || null;
    this.selectedFields = {
      id: true,
      name: true,
      description: true,
      logo: { select: { image: { select: { url: true } } } },
      owner: { select: { id: true, name: true } },
      tags: { select: { name: true } },
      _count: {
        select: { items: true },
      },
    };
  }

  async save(brand = {}) {
    let brnd;
    const name = brand.name || this.name;
    const description = brand.description || this.description;
    const tags = brand.tags || this.tags;
    const owner = brand.owner || this.owner;
    const logo = brand.logo || this.logo;
    const brandId = brand.brandId || this.brandId;

    const brandData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(brandId && { brandId }),
      ...(owner && { owner }),
      ...(logo && { logo }),
      ...(tags && { tags }),
    };

    brand = await this.find({ name, id: this.id });

    if (brand) {
      brnd = await prisma.brand.update({
        where: { id: brand.id },
        data: {
          ...brandData,
          ...(tags &&
            tags.length > 0 && {
              tags: {
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              },
            }),
          owner: { connect: { id: owner } },
        },
        select: this.selectedFields,
      });
    } else {
      brnd = await prisma.brand.create({
        data: {
          name,
          description: description.trim() || undefined,
          ...(logo && {
            logo: {
              connect: {
                id: logo,
              },
            },
          }),
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
        select: this.selectedFields,
      });
      this.id = brnd.id;
    }
    return brnd;
  }

  find(brand = {}) {
    const id = brand.id || this.id;
    const name = brand.name || this.name;

    const filters = [id && { id }, name && { name }].filter(Boolean);

    if (filters.length === 0) {
      throw new Error("At least one of id, name, or email must be provided");
    }

    return prisma.brand.findFirst({
      where: {
        OR: filters,
      },
      select: this.selectedFields,
    });
  }

  findById(id = this.id) {
    return prisma.brand.findUnique({
      where: {
        id,
      },
    });
  }

  findMany(where = {}) {
    return prisma.brand.findMany({
      where,
      select: this.selectedFields,
    });
  }

  favorite(user) {
    return prisma.favoriteBrand.upsert({
      where: {
        userId_brandId: {
          userId: user,
          brandId: this.id,
        },
      },
      create: {
        user: {
          connect: {
            id: user,
          },
        },
        brand: {
          connect: {
            id: this.id,
          },
        },
      },
      update: {},
      select: {
        id: true,
      },
    });
  }

  isFavorited(user) {
    return prisma.favoriteBrand.findFirst({
      where: {
        userId: user,
        brandId: this.id,
      },
      select: {
        id: true,
      },
    });
  }

  async unfavorite(user) {
    await prisma.favoriteBrand.delete({
      where: {
        userId_brandId: {
          userId: user,
          brandId: this.id,
        },
      },
    });
  }

  upvote(user) {
    return prisma.brandVote.upsert({
      where: {
        userId_brandId: { brandId: this.id, userId: user },
      },
      update: {
        vote: true,
      },
      create: {
        user: {
          connect: {
            id: user,
          },
        },
        brand: {
          connect: {
            id: this.id,
          },
        },
        vote: true,
      },
    });
  }

  isVoted(user) {
    return prisma.brandVote.findFirst({
      where: {
        brandId: this.id,
        userId: user,
      },
    });
  }

  downvote(user) {
    return prisma.brandVote.upsert({
      where: {
        userId_brandId: { brandId: this.id, userId: user },
      },
      update: {
        vote: false,
      },
      create: {
        user: {
          connect: {
            id: user,
          },
        },
        brand: {
          connect: {
            id: this.id,
          },
        },
        vote: false,
      },
    });
  }

  unvote(user) {
    return prisma.brandVote.delete({
      where: {
        userId_brandId: { brandId: this.id, userId: user },
      },
    });
  }

  isSubscribed(user) {
    return prisma.brandSubscription.findFirst({
      where: {
        brandId: this.id,
        userId: user,
      },
    });
  }

  subscribe(user) {
    return prisma.brandSubscription.create({
      data: {
        user: {
          connect: {
            id: user,
          },
        },
        brand: {
          connect: {
            id: this.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  unsubscribe(id) {
    return prisma.brandSubscription.delete({
      where: {
        id,
      },
    });
  }

  delete(id = this.id) {
    return prisma.brand.delete({
      where: {
        id,
      },
    });
  }
}

module.exports = Brand;
