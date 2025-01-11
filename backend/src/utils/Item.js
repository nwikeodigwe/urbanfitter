const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class Item {
  constructor(item = {}) {
    this.item = {};
    this.id = item.id || null;
    this.title = item.title || null;
    this.description = item.description || null;
    this.image = item.image || null;
    this.price = item.price || null;
    this.userId = item.userId || null;
    this.selectedFields = {
      id: true,
      title: true,
      description: true,
      image: true,
      price: true,
      userId: true,
    };
  }

  async save(item = {}) {
    let itm;
    const name = item.name || this.name;
    const description = item.description || this.description;
    const tags = item.tags || this.tags;
    const itemId = item.itemId || this.itemId;

    const itemData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(itemId && { itemId }),
      ...(tags && { tags }),
    };

    if (this.id) {
      itm = await prisma.item.update({
        where: { id: this.id },
        data: itemData,
        select: this.selectedFields,
      });
    } else {
      itm = await prisma.item.create({
        data: itemData,
        select: this.selectedFields,
      });
      this.id = itm.id;
    }
    return itm;
  }

  find(item = {}) {
    const id = item.id || this.id;
    const name = item.name || this.name;

    const filters = [id && { id }, name && { name }].filter(Boolean);

    if (filters.length === 0) {
      throw new Error("At least one of id, name, or email must be provided");
    }

    return prisma.item.findFirst({
      where: {
        OR: filters,
      },
      select: this.selectedFields,
    });
  }

  findById(id = this.id) {
    return prisma.item.findUnique({
      where: {
        id,
      },
    });
  }

  findMany(where = {}) {
    return prisma.item.findMany({
      where,
      select: this.selectedFields,
    });
  }

  delete(id = this.id) {
    return prisma.item.delete({
      where: {
        id,
      },
    });
  }
}
