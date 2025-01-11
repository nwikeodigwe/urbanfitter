const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class Collection {
  constructor(collection = {}) {
    this.collection = {};
    this.id = collection.id || null;
    this.title = collection.title || null;
    this.description = collection.description || null;
    this.image = collection.image || null;
    this.userId = collection.userId || null;
    this.selectedFields = {
      id: true,
      title: true,
      description: true,
      image: true,
      price: true,
      userId: true,
    };
  }

  async save(collection = {}) {
    let collect;
    const name = collection.name || this.name;
    const description = collection.description || this.description;
    const tags = collection.tags || this.tags;
    const collectionId = collection.collectionId || this.collectionId;

    const collectionData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(collectionId && { collectionId }),
      ...(tags && { tags }),
    };

    if (this.id) {
      collect = await prisma.collection.update({
        where: { id: this.id },
        data: collectionData,
        select: this.selectedFields,
      });
    } else {
      collect = await prisma.collection.create({
        data: collectionData,
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

  delete(id = this.id) {
    return prisma.collection.delete({
      where: {
        id,
      },
    });
  }
}

module.exports = Collection;
