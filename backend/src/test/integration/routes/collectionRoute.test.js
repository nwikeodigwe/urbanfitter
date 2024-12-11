const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const app = require("../../../app");
let server;

const prisma = new PrismaClient();

describe("Collection route", () => {
  let user;
  let collection;
  let style;
  let token;
  let header;

  const auth = async () => {
    const res = await request(server).post("/api/auth/signup").send(user);
    return res.body.token;
  };

  const createCollection = () => {
    return prisma.collection.create({
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
  };

  const favoriteCollection = async (collectionId) => {
    const usr = await prisma.user.findFirst({
      where: {
        email: user.email,
      },
      select: {
        id: true,
      },
    });
    return await prisma.favoriteCollection.upsert({
      where: {
        userId_collectionId: {
          userId: usr.id,
          collectionId: collectionId,
        },
      },
      create: {
        user: {
          connect: {
            email: user.email,
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
  };

  const createStyle = (collectionId) => {
    return prisma.style.create({
      data: {
        name: style.name,
        description: style.description,
        tags: {
          connectOrCreate: style.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        collection: { connect: { id: collectionId } },
        author: { connect: { email: user.email } },
      },
      select: {
        id: true,
      },
    });
  };

  const createVote = async (collectionId) => {
    const usr = await prisma.user.findFirst({
      where: {
        email: user.email,
      },
      select: {
        id: true,
      },
    });
    return await prisma.collectionVote.upsert({
      where: {
        userId_collectionId: {
          collectionId: collectionId,
          userId: usr.id,
        },
      },
      update: {
        vote: 1,
      },
      create: {
        user: {
          connect: {
            id: usr.id,
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

    style = {
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

  describe("GET /:collection/styles", () => {
    it("Should return 404 if no style found", async () => {
      collection = await createCollection();
      const res = await request(server)
        .get(`/api/collection/${collection.id}/styles`)
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if style is found", async () => {
      collection = await createCollection();
      await createStyle(collection.id);
      const res = await request(server)
        .get(`/api/collection/${collection.id}/styles`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });
  describe("POST /:collection/favorite", () => {
    it("Should return 404 if collection not found", async () => {
      const res = await request(server)
        .post("/api/collection/collectionId/favorite")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 201 if collection favorited", async () => {
      collection = await createCollection();
      const res = await request(server)
        .post(`/api/collection/${collection.id}/favorite`)
        .set(header);

      expect(res.status).toBe(201);
    });
  });

  describe("DELETE /:collection/unfovorite", () => {
    it("Should return 404 if collection not found", async () => {
      const res = await request(server)
        .post("/api/collection/collectionId/favorite")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 201 if collection unfavorited", async () => {
      collect = await createCollection();
      await favoriteCollection(collect.id);
      const res = await request(server)
        .post(`/api/collection/${collect.id}/favorite`)
        .set(header);

      expect(res.status).toBe(201);
    });
  });

  describe("PUT /:collection/upvote", () => {
    it("Should return 404 if collection not found", async () => {
      const res = await request(server)
        .put("/api/collection/collectionId/upvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 201 if collection upvoted", async () => {
      collect = await createCollection();
      const res = await request(server)
        .put(`/api/collection/${collect.id}/upvote`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("PUT /:collection/downvote", () => {
    it("Should return 404 if collection not found", async () => {
      const res = await request(server)
        .put("/api/collection/collectionId/upvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if collection downvoted", async () => {
      collect = await createCollection();
      const res = await request(server)
        .put(`/api/collection/${collect.id}/downvote`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /:collection/unvote", () => {
    it("Should return 404 if collection not found", async () => {
      const res = await request(server)
        .delete("/api/collection/collectionId/unvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 404 if vote not found", async () => {
      const res = await request(server)
        .delete("/api/collection/collectionId/unvote")
        .set(header);
    });

    it("Should return 200 if collection unvoted", async () => {
      collect = await createCollection();
      await createVote(collect.id);
      const res = await request(server)
        .delete(`/api/collection/${collect.id}/unvote`)
        .set(header);

      expect(res.status).toBe(204);
    });
  });

  describe("PATCH /:collection", () => {
    it("Should return 404 if collection not found", async () => {
      const res = await request(server)
        .patch("/api/collection/collectionId")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 400 if tag is not an array", async () => {
      collection.tag = "tag";
      const collect = await createCollection();
      const res = await request(server)
        .patch(`/api/collection/${collect.id}`)
        .set(header)
        .send(collection);
    });

    it("Should return 200 if collection downvoted", async () => {
      collect = await createCollection();
      const res = await request(server)
        .patch(`/api/collection/${collect.id}`)
        .set(header)
        .send(collection);

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /:collection", () => {
    it("Should return 404 if collection not found", async () => {
      const res = await request(server)
        .delete("/api/collection/collectionId")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 204 if collection deleted", async () => {
      collect = await createCollection();
      const res = await request(server)
        .delete(`/api/collection/${collect.id}`)
        .set(header);

      expect(res.status).toBe(204);
    });
  });
});
