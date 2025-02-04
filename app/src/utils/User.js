const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const logger = require("./Logger");
const Mail = require("./Mail");

const prisma = new PrismaClient();
const mail = new Mail();

class User {
  constructor(user = {}) {
    this.user = {};
    this.id = user.id || null;
    this.name = user.name || null;
    this.email = user.email || null;
    this.password = user.password || null;
    this.resetToken = user.resetToken || null;

    this.selectedFields = {
      id: true,
      name: true,
      email: true,
    };
  }

  async save(user = {}) {
    const name = user.name || this.name;
    const email = user.email || this.email;
    const password = user.password || this.password;
    let usr;

    const userData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(password && { password: bcrypt.hashSync(password, 10) }),
    };

    if (this.id) {
      usr = await prisma.user.update({
        where: { id: this.id },
        data: userData,
        select: this.selectedFields,
      });
    } else {
      usr = await prisma.user.create({
        data: userData,
        select: this.selectedFields,
      });
      this.id = usr.id;
    }
    return usr;
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
      select: this.selectedFields,
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

  async isSubscribedTo(id) {
    let subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: id,
        subscriberId: this.id,
      },
    });

    return !!subscription;
  }

  subscribeTo(id) {
    return prisma.userSubscription.create({
      data: {
        subscriber: {
          connect: {
            id: this.id,
          },
        },
        user: {
          connect: {
            id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  unsubscribeFrom(id) {
    return prisma.userSubscription.delete({
      where: {
        userId_subscriberId: {
          userId: id,
          subscriberId: this.id,
        },
      },
    });
  }

  async #getPassword() {
    const id = this.id;
    const email = this.email;

    const filters = [id && { id }, email && { email }].filter(Boolean);

    if (filters.length === 0) {
      throw new Error("At least one of id, name, or email must be provided");
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: filters,
      },
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

  async createToken(user = {}) {
    const usr = await this.find();

    const id = user.id || this.id || usr.id;
    const name = user.name || this.name || usr.name;
    const email = user.email || this.email;
    return jwt.sign(
      {
        id,
        name,
        email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  }

  mail(template, user = {}, attr = {}) {
    const name = user.name || this.name;
    const email = user.email || this.email;

    const type = {
      welcome: {
        template: mail.WELCOME,
        subject: mail.WELCOME_SUBJECT,
        from: mail.WELCOME_FROM,
      },
    };

    mail.content({
      name,
      email,
      subject: type[template].subject,
      from: type[template].from,
      ...attr,
    });

    template && email && logger.info(`Sending ${template} email to ${email}`);
    return mail.send(type[template].template);
  }

  async createResetToken() {
    await prisma.reset.updateMany({
      where: { user: { email: this.email }, expires: { lte: new Date() } },
      data: { expires: new Date() },
    });

    const salt = await bcrypt.genSalt(10);
    const token = salt.substr(20);

    await prisma.reset.create({
      data: {
        token: token.toString(),
        expires: new Date(Date.now() + 600000),
        user: { connect: { email: this.email } },
      },
    });
  }

  async isValidResetToken() {
    const reset = await prisma.reset.findUnique({
      where: { token: this.resetToken },
      select: { id: true },
    });

    if (!reset) return false;

    if (reset.expires < new Date()) return false;
  }

  updateProfile(data = {}) {
    return prisma.profile.upsert({
      where: { userId: this.id },
      update: { ...data },
      create: { ...data, user: { connect: { id: this.id } } },
      select: {
        firstname: true,
        lastname: true,
        bio: true,
      },
    });
  }

  delete() {
    this.id && logger.info(`Deleting user ${this.id}`);
    return prisma.user.delete({
      where: {
        id: this.id,
      },
      select: this.selectedFields,
    });
  }
}

module.exports = User;
