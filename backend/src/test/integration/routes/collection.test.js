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
});
