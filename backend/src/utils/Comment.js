const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class Comment {
  constructor(comment = {}) {
    this.id = comment.id;
    this.entity = "BRAND";
    this.selectedFields = {
      id: true,
      author: { select: { id: true, name: true } },
      content: true,
    };
  }

  save(comment = {}) {
    return prisma.comment.create({
      data: {
        content: comment.content,
        ...(comment.tags && {
          tag: {
            connectOrCreate: comment.tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
        author: {
          connect: {
            id: comment.userId,
          },
        },
        entity: this.entity,
        entityId: comment.entityId,
        ...(this.id && {
          parent: { connect: { id: this.id } },
        }),
      },
      select: this.selectedFields,
    });
  }

  find(id = this.id) {
    return prisma.comment.findUnique({
      where: { id },
      select: this.selectedFields,
    });
  }

  findMany(where = {}) {
    return prisma.comment.findMany({
      where,
      select: this.selectedFields,
    });
  }
}

module.exports = Comment;
