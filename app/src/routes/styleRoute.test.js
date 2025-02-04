const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const app = require("../app");
let server;

const prisma = new PrismaClient();

describe("Style Route", () => {
  let user;
  let style;
  let collection;
  let comment;
  let token;
  let header;

  const auth = async () => {
    const res = await request(server).post("/api/auth/signup").send(user);
    return res.body.token;
  };

  const createStyle = async (collectionId) => {
    const stle = await prisma.style.create({
      data: {
        name: style.name,
        description: style.description,
        tags: {
          connectOrCreate: style.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        collection: collectionId,
        author: { connect: { email: user.email } },
      },
    });

    return stle.id;
  };

  const upvote = async (styleId) => {
    return prisma.styleVote.create({
      data: {
        style: { connect: { id: styleId } },
        user: { connect: { email: user.email } },
      },
    });
  };

  const favoriteStyle = async (styleId) => {
    user = await prisma.user.findFirst({
      where: {
        email: user.email,
      },
      select: { id: true },
    });

    return await prisma.favoriteStyle.upsert({
      where: {
        userId_styleId: {
          userId: user.id,
          styleId,
        },
      },
      create: {
        user: {
          connect: {
            id: user.id,
          },
        },
        style: {
          connect: {
            id: styleId,
          },
        },
      },
      update: {},
      select: {
        id: true,
      },
    });
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

  const createComment = (entityId) => {
    return prisma.comment.create({
      data: {
        content: comment.content,
        author: { connect: { email: user.email } },
        entity: "STYLE",
        entityId,
      },
      select: {
        id: true,
      },
    });
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

    comment = {
      content: "content",
      tags: ["tag1", "tag2"],
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

  describe("GET /", () => {
    it("Should return 404 if no style found", async () => {
      const res = await request(server).get("/api/style").set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if style found", async () => {
      style = await createStyle();
      const res = await request(server).get(`/api/style`).set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /:style", () => {
    it("Should return 404 if style not found", async () => {
      const res = await request(server).get("/api/style/styleId").set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if style found", async () => {
      style = await createStyle();
      const res = await request(server).get(`/api/style/${style}`).set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /me", () => {
    it("Should return 404 if style not found", async () => {
      const res = await request(server).get("/api/style/me").set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if style found", async () => {
      style = await createStyle();
      const res = await request(server).get(`/api/style/me`).set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("POST /:style/favorite", () => {
    it("Should return 404 if style is not found", async () => {
      const res = await request(server)
        .post("/api/style/styleId/favorite")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 201 if style favorited", async () => {
      style = await createStyle();
      const res = await request(server)
        .post(`/api/style/${style}/favorite`)
        .set(header);

      expect(res.status).toBe(201);
    });
  });

  describe("POST /:style/unfavorite", () => {
    it("Should return 404 if style is not found", async () => {
      const res = await request(server)
        .delete("/api/style/styleId/unfavorite")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 404 if style is not favorited", async () => {
      style = await createStyle();
      const res = await request(server)
        .delete(`/api/style/${style}/unfavorite`)
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 204 if style unfavorited", async () => {
      style = await createStyle();
      await favoriteStyle(style);
      const res = await request(server)
        .delete(`/api/style/${style}/unfavorite`)
        .set(header);

      expect(res.status).toBe(204);
    });
  });

  describe("PUT /:style/upvote", () => {
    it("Should return 404 if style is not found", async () => {
      const res = await request(server)
        .put("/api/style/styleId/upvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if style upvoted", async () => {
      style = await createStyle();
      const res = await request(server)
        .put(`/api/style/${style}/upvote`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("PUT /:style/downvote", () => {
    it("Should return 404 if style is not found", async () => {
      const res = await request(server)
        .put("/api/style/styleId/downvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if style downvoted", async () => {
      style = await createStyle();
      const res = await request(server)
        .put(`/api/style/${style}/downvote`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /:style/unvote", () => {
    it("Should return 404 if style is not found", async () => {
      const res = await request(server)
        .delete("/api/style/styleId/unvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 204 if style unvoted", async () => {
      style = await createStyle();
      await upvote(style);
      const res = await request(server)
        .delete(`/api/style/${style}/unvote`)
        .set(header);

      expect(res.status).toBe(204);
    });
  });

  describe("POST /:style/comment", () => {
    it("Should return 404 if style is not found", async () => {
      const res = await request(server)
        .post("/api/style/styleId/comment")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 400 if comment not provided", async () => {
      style = await createStyle();
      const res = await request(server)
        .post(`/api/style/${style}/comment`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 400 if tag is not an array", async () => {
      comment.tags = "tag";
      style = await createStyle();
      const res = await request(server)
        .post(`/api/style/${style}/comment`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(400);
    });

    it("Should return 201 if comment successful", async () => {
      style = await createStyle();
      const res = await request(server)
        .post(`/api/style/${style}/comment`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(201);
    });
  });

  describe("POST /:style/comment/:comment", () => {
    it("Should return 404 if style not found", async () => {
      const res = await request(server)
        .post("/api/style/styleId/comment/commentId")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 400 if tag is not an array", async () => {
      style = await createStyle();
      const comnt = createComment(style);
      const res = await request(server)
        .post(`/api/style/${style}/comment/${comnt}`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 400 if comment not provided", async () => {
      style = await createStyle();
      const comnt = createComment(style);
      const res = await request(server)
        .post(`/api/style/${style}/comment/${comnt.id}`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 404 if no comment found", async () => {
      style = await createStyle();
      const res = await request(server)
        .post(`/api/style/${style}/comment/commentId`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 201 if comment successful", async () => {
      style = await createStyle();
      const comnt = await createComment(style);
      const res = await request(server)
        .post(`/api/style/${style}/comment/${comnt.id}`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(201);
    });
  });

  describe("GET /:style/comments", () => {
    it("Should return 404 if style not found", async () => {
      const res = await request(server)
        .get("/api/style/styleId/comments")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if comment found", async () => {
      style = await createStyle();
      await createComment(style);
      const res = await request(server)
        .get(`/api/style/${style}/comments`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /comment/:comment", () => {
    it("Should return 404 if comment not found", async () => {
      const res = await request(server)
        .delete("/api/style/comment/commentId")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 204 if comment deleted", async () => {
      style = await createStyle();
      const comnt = await createComment(style);
      const res = await request(server)
        .delete(`/api/style/comment/${comnt.id}`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(204);
    });
  });

  describe("DELETE /:style", () => {
    it("Should return 404 if comment not found", async () => {
      const res = await request(server)
        .delete("/api/style/styleId")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 204 if comment found", async () => {
      style = await createStyle();
      const res = await request(server)
        .delete(`/api/style/${style}`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(204);
    });
  });
});
