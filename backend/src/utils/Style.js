const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class Style {
  constructor(style = {}) {
    this.id = style.id;

    this.selectedFields = {
      id: true,
      name: true,
      description: true,
    };
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
}

module.exports = Style;
