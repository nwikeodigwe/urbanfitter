const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class Style {
  constructor(style = {}) {
    this.id = style.id;
    this.name = style.name;
    this.description = style.description;
    this.tags = style.tags || [];
    this.author = style.author;

    this.selectedFields = {
      id: true,
      name: true,
      description: true,
      collection: {
        select: {
          name: true,
          id: true,
        },
      },
      author: {
        select: { name: true, id: true },
      },
    };
  }

  async save(style = {}) {
    let styl;
    const name = style.name || this.name;
    const description = style.description || this.description;
    const tags = style.tags || this.tags;
    const author = style.author || this.author;
    const collection = style.collection || this.collection;

    const styleData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(author && { author }),
      ...(tags && { tags }),
    };

    if (this.id) {
      styl = await prisma.style.update({
        where: { id: this.id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(tags &&
            tags.length > 0 && {
              tags: {
                deleteMany: {},
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              },
            }),
        },
        select: this.selectedFields,
      });
    } else {
      styl = await prisma.style.create({
        data: {
          ...styleData,
          ...(tags &&
            tags.length > 0 && {
              tags: {
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              },
            }),
          ...(collection && {
            collection: {
              connect: {
                id: collection,
              },
            },
          }),
          author: {
            connect: {
              id: author,
            },
          },
        },
        select: this.selectedFields,
      });
    }
    return styl;
  }

  find(style = {}) {
    const id = style.id || this.id;
    const name = style.name || this.name;

    const filters = [id && { id }, name && { name }].filter(Boolean);

    if (filters.length === 0) {
      throw new Error("At least one of id, or name, must be provided");
    }

    return prisma.style.findFirst({
      where: {
        OR: filters,
      },
      select: this.selectedFields,
    });
  }

  findMany(where) {
    return prisma.style.findMany({
      where,
      select: this.selectedFields,
    });
  }

  favorite(user) {
    return prisma.favoriteStyle.upsert({
      where: {
        userId_styleId: {
          userId: user,
          styleId: this.id,
        },
      },
      create: {
        user: {
          connect: {
            id: user,
          },
        },
        style: {
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
    return prisma.favoriteStyle.findFirst({
      where: {
        userId: user,
        styleId: this.id,
      },
      select: {
        id: true,
      },
    });
  }

  async unfavorite(user) {
    await prisma.favoriteStyle.delete({
      where: {
        userId_styleId: {
          userId: user,
          styleId: this.id,
        },
      },
    });
  }

  upvote(user) {
    return prisma.styleVote.upsert({
      where: {
        userId_styleId: { styleId: this.id, userId: user },
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
        style: {
          connect: {
            id: this.id,
          },
        },
        vote: true,
      },
    });
  }

  isVoted(user) {
    return prisma.styleVote.findFirst({
      where: {
        styleId: this.id,
        userId: user,
      },
    });
  }

  downvote(user) {
    return prisma.styleVote.upsert({
      where: {
        userId_styleId: { styleId: this.id, userId: user },
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
        style: {
          connect: {
            id: this.id,
          },
        },
        vote: false,
      },
    });
  }

  unvote(user) {
    return prisma.styleVote.delete({
      where: {
        userId_styleId: { styleId: this.id, userId: user },
      },
    });
  }

  delete() {
    return prisma.style.delete({
      where: {
        id: this.id,
      },
    });
  }
}

module.exports = Style;
