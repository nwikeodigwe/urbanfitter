const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class Collection {
  constructor(collection = {}) {
    this.collection = {};
    this.id = collection.id || null;
    this.title = collection.name || null;
    this.description = collection.description || null;
    this.authorId = collection.authorId || null;
    this.selectedFields = {
      id: true,
      name: true,
      description: true,
      author: { select: { id: true } },
    };
  }

  async save(collection = {}) {
    let collect;
    const name = collection.name || this.name;
    const description = collection.description || this.description;
    const tags = collection.tags || this.tags;
    const id = collection.id || this.id;
    const authorId = collection.authorId || this.authorId;

    const collectionData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(id && { id }),
      ...(tags && { tags }),
    };

    if (this.id) {
      collect = await prisma.collection.update({
        where: { id: this.id },
        data: {
          ...collectionData,
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
    } else {
      collect = await prisma.collection.create({
        data: {
          ...collectionData,
          ...(tags &&
            tags.length > 0 && {
              tags: {
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              },
            }),
          author: { connect: { id: authorId } },
        },
        select: this.selectedFields,
      });
      this.id = collect.id;
    }
    return collect;
  }

  find(collection = {}) {
    const id = collection.id || this.id;
    const name = collection.name || this.name;

    const filters = [id && { id }, name && { name }].filter(Boolean);

    if (filters.length === 0) {
      throw new Error("At least one of id, name, or email must be provided");
    }

    return prisma.collection.findFirst({
      where: {
        OR: filters,
      },
      select: this.selectedFields,
    });
  }

  findById(id = this.id) {
    return prisma.collection.findUnique({
      where: {
        id,
      },
    });
  }

  findMany(where = {}) {
    return prisma.collection.findMany({
      where,
      select: this.selectedFields,
    });
  }

  favorite(userId, collectionId = this.id) {
    return prisma.favoriteCollection.upsert({
      where: {
        userId_collectionId: {
          userId: userId,
          collectionId: collectionId,
        },
      },
      create: {
        user: {
          connect: {
            id: userId,
          },
        },
        collection: {
          connect: {
            id: collectionId,
          },
        },
      },
      update: {},
      select: {
        id: true,
      },
    });
  }

  async isFavorited(userId, collectionId = this.id) {
    const favorite = await prisma.favoriteCollection.findFirst({
      where: {
        userId_collectionId: {
          userId: userId,
          collectionId: collectionId,
        },
      },
    });

    return Boolean(favorite);
  }

  unfavorite(userId, collectionId = this.id) {
    return prisma.favoriteCollection.delete({
      where: {
        userId_collectionId: {
          userId: userId,
          collectionId: collectionId,
        },
      },
    });
  }

  upvote(userId, collectionId = this.id) {
    return prisma.collectionVote.upsert({
      where: {
        userId_collectionId: {
          collectionId: collectionId,
          userId: userId,
        },
      },
      update: {
        vote: 1,
      },
      create: {
        user: {
          connect: {
            id: userId,
          },
        },
        collection: {
          connect: {
            id: collectionId,
          },
        },
        vote: 1,
      },
    });
  }

  downvote(userId, collectionId = this.id) {
    return prisma.collectionVote.upsert({
      where: {
        userId_collectionId: {
          collectionId: collectionId,
          userId: userId,
        },
      },
      update: {
        vote: -1,
      },
      create: {
        user: {
          connect: {
            id: userId,
          },
        },
        collection: {
          connect: {
            id: collectionId,
          },
        },
        vote: -1,
      },
    });
  }

  async isVoted(userId, collectionId = this.id) {
    const vote = await prisma.collectionVote.findFirst({
      where: {
        userId: userId,
        collectionId: collectionId,
      },
    });

    return Boolean(vote);
  }

  unvote(userId, collectionId = this.id) {
    return prisma.collectionVote.delete({
      where: {
        userId_collectionId: {
          collectionId: collectionId,
          userId: userId,
        },
      },
    });
  }

  delete(id = this.id) {
    return prisma.collection.delete({
      where: {
        id,
      },
    });
  }
}

module.exports = Collection;
