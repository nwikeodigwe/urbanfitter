const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const app = require("../app");
let server;

const prisma = new PrismaClient();

describe("Item route", () => {
  let user;
  let item;
  let token;
  let header;
  let image;

  const auth = async () => {
    const res = await request(server).post("/api/auth/signup").send(user);
    return res.body.token;
  };

  const createItem = async () => {
    return prisma.item.create({
      data: {
        name: item.name,
        description: item.description,
        tags: {
          connectOrCreate: item.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        images: {
          connect: item.images.map((image) => ({
            id: image,
          })),
        },
        brand: {
          connectOrCreate: {
            where: { name: item.brand },
            create: { name: item.brand },
          },
        },
        creator: { connect: { email: user.email } },
      },
      select: {
        id: true,
      },
    });
  };

  const favoriteItem = async (itemId) => {
    user = await prisma.user.findFirst({
      where: {
        email: user.email,
      },
      select: {
        id: true,
      },
    });

    await prisma.favoriteItem.upsert({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: itemId,
        },
      },
      create: {
        user: {
          connect: {
            id: user.id,
          },
        },
        item: {
          connect: {
            id: itemId,
          },
        },
      },
      update: {},
    });
  };

  const upvote = async (itemId) => {
    user = await prisma.user.findFirst({
      where: {
        email: user.email,
      },
      select: {
        id: true,
      },
    });
    return prisma.itemVote.upsert({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: itemId,
        },
      },
      create: {
        user: {
          connect: { id: user.id },
        },
        item: { connect: { id: itemId } },
      },
      update: {},
    });
  };

  const createImage = () => {
    return prisma.image.create({
      data: {
        url: "http://image.com/image.png",
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

    image = await createImage();

    item = {
      name: "name",
      description: "description",
      tags: ["tag1"],
      images: [image.id],
      brand: "brand",
    };

    token = await auth();
    header = { authorization: `Bearer ${token}` };
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.item.deleteMany();
    await prisma.$disconnect();
    await server.close();
  });

  describe("POST /", () => {
    it("Should return 400 if name and description not provided", async () => {
      const res = await request(server).post("/api/item").set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 400 if image not provided", async () => {
      item.images = undefined;
      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send(item);

      expect(res.status).toBe(400);
    });

    it("Should return 400 if tag is not an array", async () => {
      item.tags = "tag";
      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send(item);

      expect(res.status).toBe(400);
    });

    it("Should return 400 if brand not provided", async () => {
      item.brand = null;
      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send(item);

      expect(res.status).toBe(400);
    });

    it("Should return 201 if item created", async () => {
      const res = await request(server)
        .post("/api/item")
        .set(header)
        .send(item);

      expect(res.status).toBe(201);
    });
  });

  describe("GET /", () => {
    it("Should return 404 if no item found", async () => {
      const res = await request(server).get("/api/item").set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 item found", async () => {
      await createItem();
      const res = await request(server).get(`/api/item`).set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /:item", () => {
    it("Should return 404 if no item found", async () => {
      const res = await request(server).get("/api/item/ItemId").set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 item found", async () => {
      const item = await createItem();
      const res = await request(server).get(`/api/item/${item.id}`).set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /:item", () => {
    it("Should return 404 if no item found", async () => {
      const res = await request(server).get("/api/item/ItemId").set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 item found", async () => {
      const item = await createItem();
      const res = await request(server).get(`/api/item/${item.id}`).set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("POST /favorite", () => {
    it("Should return 404 if no item found", async () => {
      const res = await request(server)
        .post("/api/item/ItemId/favorite")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 item found", async () => {
      item = await createItem();
      const res = await request(server)
        .post(`/api/item/${item.id}/favorite`)
        .set(header);

      expect(res.status).toBe(201);
    });
  });

  describe("DELETE /unfavorite", () => {
    it("Should return 404 if no item found", async () => {
      const res = await request(server)
        .delete("/api/item/ItemId/unfavorite")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 400 if item not favorited", async () => {
      item = await createItem();
      const res = await request(server)
        .delete(`/api/item/${item.id}/unfavorite`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 204 if item unfavorited", async () => {
      item = await createItem();
      await favoriteItem(item.id);
      const res = await request(server)
        .delete(`/api/item/${item.id}/unfavorite`)
        .set(header);

      expect(res.status).toBe(204);
    });
  });

  describe("PUT /:item/upvote", () => {
    it("Should return 404 if brand is not found", async () => {
      const res = await request(server)
        .put("/api/item/itemId/upvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if item upvoted", async () => {
      item = await createItem();
      const res = await request(server)
        .put(`/api/item/${item.id}/upvote`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("PUT /:item/downvote", () => {
    it("Should return 404 if item is not found", async () => {
      const res = await request(server)
        .put("/api/item/itemId/downvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if brand downvoted", async () => {
      item = await createItem();
      const res = await request(server)
        .put(`/api/item/${item.id}/downvote`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /:item/unvote", () => {
    it("Should return 404 if item not found", async () => {
      const res = await request(server)
        .delete("/api/item/itemId/unvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 204 if item unvoted", async () => {
      item = await createItem();
      await upvote(item.id);
      const res = await request(server)
        .delete(`/api/item/${item.id}/unvote`)
        .set(header);

      expect(res.status).toBe(204);
    });
  });

  describe("PATCH /:item/", () => {
    it("Should return 404 if item not found", async () => {
      const res = await request(server).patch("/api/item/itemId").set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if item updated", async () => {
      item = await createItem();
      const res = await request(server)
        .patch(`/api/item/${item.id}`)
        .set(header)
        .send({ name: "name++" });

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /:item", () => {
    it("Should return 404 if item not found", async () => {
      const res = await request(server).delete("/api/item/itemId").set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 204 if item deleted", async () => {
      item = await createItem();
      const res = await request(server)
        .delete(`/api/item/${item.id}`)
        .set(header);

      expect(res.status).toBe(204);
    });
  });
});
