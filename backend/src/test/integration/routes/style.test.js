const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const app = require("../../../app");
let server;

const prisma = new PrismaClient();

describe("Style Route", () => {
  let user;
  let style;
  let collection;
  let token;
  let header;

  const auth = async () => {
    const res = await request(server).post("/api/auth/signup").send(user);
    return res.body.token;
  };

  const createCollection = async () => {
    const collect = await prisma.collection.create({
      data: {
        name: collection.name,
        description: collection.description,
        tags: {
          connectOrCreate: collection.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        author: { connect: { email: user.email } },
      },
      select: {
        id: true,
      },
    });

    return collect.id;
  };

  beforeEach(async () => {
    server = app.listen(0, () => {
      server.address().port;
    });

    user = {
      email: "test@test.com",
      password: "password",
    };

    style = {
      name: "name",
      description: "description",
      tags: ["tag1", "tag2"],
      collection: "collectionId",
    };

    collection = {
      name: "name",
      description: "description",
      tags: ["tag1", "tag2"],
    };

    token = await auth();
    header = { authorization: `Bearer ${token}` };
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.style.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.$disconnect();
    await server.close();
  });

  describe("POST /", () => {
    it("Should return 400 if name and description not provided", async () => {
      const res = await request(server).post("/api/style").set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 404 if collection not found", async () => {
      const res = await request(server)
        .post("/api/style")
        .set(header)
        .send(style);

      expect(res.status).toBe(404);
    });

    it("Should return 400 if tag is not an array", async () => {
      style.tags = "tag";
      style.collection = await createCollection();
      const res = await request(server)
        .post("/api/style")
        .set(header)
        .send(style);

      expect(res.status).toBe(400);
    });

    it("Should return 201 if style created", async () => {
      style.collection = await createCollection();
      const res = await request(server)
        .post("/api/style")
        .set(header)
        .send(style);

      expect(res.status).toBe(201);
    });
  });
});
