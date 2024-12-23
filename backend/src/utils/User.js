const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

class User {
  constructor(user = {}) {
    this.user = {};
    this.id = user.id || null;
    this.name = user.name || null;
    this.email = user.email || null;
    this.password = user.password || null;

    this.selectedFields = {
      id: true,
      name: true,
      email: true,
    };
  }

  create(data = {}) {
    return prisma.user.create({
      data,
      select: this.selectedFields,
    });
  }

  createOrUpdate(data = {}) {
    return prisma.user.upsert({
      where: { id: this.id },
      update: data,
      create: data,
      select: this.selectedFields,
    });
  }

  find(user = {}) {
    const id = user.id || this.id;
    const name = user.name || this.name;
    const email = user.email || this.email;

    const filters = [id && { id }, name && { name }, email && { email }].filter(
      Boolean
    );

    if (filters.length === 0) {
      throw new Error("At least one of id, name, or email must be provided");
    }

    return prisma.user.findFirst({
      where: {
        OR: filters,
      },
      select: this.selectedFields,
    });
  }

  findById(id = this.id) {
    return prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  findMany(where = {}) {
    return prisma.user.findMany({
      where,
      select: this.selectedFields,
    });
  }

  update(data = {}) {
    return prisma.user.update({
      where: {
        id: this.id,
      },
      data: {
        ...data,
      },
      select: this.selectedFields,
    });
  }

  async #getPassword() {
    const user = await prisma.user.findUnique({
      where: { id: this.id },
      select: { password: true },
    });
    return user.password;
  }

  hashPassword(password = this.password) {
    return bcrypt.hashSync(password, 10);
  }

  async passwordMatch(password = this.password) {
    const passwordHash = await this.#getPassword();
    return bcrypt.compare(password, passwordHash);
  }

  delete() {
    return prisma.user.delete({
      where: {
        id: this.id,
      },
      select: this.selectedFields,
    });
  }
}

module.exports = User;
