const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const app = require("../../../app");
let server;

const prisma = new PrismaClient();

describe("Collection route", () => {
  let user;
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

    return collect;
  };
  beforeEach(async () => {
    server = app.listen(0, () => {
      server.address().port;
    });

    user = {
      email: "test@email.com",
      password: "password",
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
    await prisma.collection.deleteMany();
    await prisma.$disconnect();
    await server.close();
  });

  describe("POST /", () => {
    it("Should return 400 if name and description are not given", async () => {
      const res = await request(server).post("/api/collection").set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 400 if tag is not an array", async () => {
      collection.tags = "tag1";
      const res = await request(server)
        .post("/api/collection")
        .set(header)
        .send(collection);

      expect(res.status).toBe(400);
    });

    it("Should return 201 collection created", async () => {
      const res = await request(server)
        .post("/api/collection")
        .set(header)
        .send(collection);

      expect(res.status).toBe(201);
    });
  });

  describe("GET /", () => {
    it("Should return 404 if no collection found", async () => {
      const res = await request(server).get("/api/collection").set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if collection found", async () => {
      await createCollection();
      const res = await request(server).get("/api/collection").set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /:collection", () => {
    it("Should return 404 if collection not fouund", async () => {
      const res = await request(server)
        .get("/api/collection/collectionId")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if collection found", async () => {
      collection = await createCollection();
      const res = await request(server)
        .get(`/api/collection/${collection.id}`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });
});
