const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const app = require("../../../app");
let server;

const prisma = new PrismaClient();

describe("Brand route", () => {
  let user;
  let brand;
  let comment;
  const auth = async () => {
    const res = await request(server).post("/api/auth/signup").send(user);
    return res.body.token;
  };

  const createLogo = async () => {
    const image = await prisma.image.create({
      data: { url: "https://image.com" },
      select: { id: true },
    });

    const logo = await prisma.logo.create({
      data: {
        image: {
          connect: { id: image.id },
        },
      },
      select: { id: true },
    });

    return logo.id;
  };

  const createBrand = async () => {
    const logo = await createLogo();

    return prisma.brand.create({
      data: {
        name: brand.name,
        owner: { connect: { email: user.email } },
        logo: { connect: { id: logo } },
        description: brand.description,
        tags: {
          connectOrCreate: brand.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });
  };

  const favoriteBrand = () => {
    return prisma.favoriteBrand.create({
      data: {
        user: { connect: { email: user.email } },
        brand: { connect: { name: brand.name } },
      },
    });
  };

  const upvote = () => {
    return prisma.brandVote.create({
      data: {
        brand: { connect: { name: brand.name } },
        user: { connect: { email: user.email } },
      },
    });
  };

  const subscribeBrand = () => {
    return prisma.brandSubscription.create({
      data: {
        brand: { connect: { name: brand.name } },
        user: { connect: { email: user.email } },
      },
    });
  };

  const createComment = async (id) => {
    return prisma.comment.create({
      data: {
        content: comment.content,
        author: { connect: { email: user.email } },
        entity: "BRAND",
        entityId: id,
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
      email: "test@email.com",
      password: "password",
    };
    const logo = await createLogo();
    brand = {
      name: "name",
      owner: user.email,
      logo: logo,
      description: "This is  a very stylish streatware brand",
      tags: ["Luxury", "Classy"],
    };
    comment = {
      content: "comment",
      tags: ["tag1", "tag2"],
    };
    token = await auth();
    header = { authorization: `Bearer ${token}` };
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.$disconnect();
    await server.close();
  });

  describe("POST /", () => {
    it("should return 400 if name is not provided", async () => {
      brand.name = undefined;
      const res = await request(server)
        .post("/api/brand")
        .set(header)
        .send(brand);

      expect(res.status).toBe(400);
    });

    it("should return 400 if tag is not an array", async () => {
      brand.tags = "tag";
      const res = await request(server)
        .post("/api/brand")
        .set(header)
        .send(brand);

      expect(res.status).toBe(400);
    });

    it("should return 400 if brand image already exists", async () => {
      await createBrand();
      const res = await request(server)
        .post("/api/brand")
        .set(header)
        .send(brand);

      expect(res.status).toBe(400);
    });

    it("should return 400 if brand already exists", async () => {
      await createBrand();
      brand.logo = await createLogo();
      const res = await request(server)
        .post("/api/brand")
        .set(header)
        .send(brand);

      expect(res.status).toBe(400);
    });

    it("Should return 201 if brand is created", async () => {
      brand.logo = await createLogo();
      const res = await request(server)
        .post("/api/brand")
        .set(header)
        .send(brand);

      expect(res.status).toBe(201);
    });
  });

  describe("GET /", () => {
    it("Should return 400 if no brand found", async () => {
      const res = await request(server).get("/api/brand").set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if no brand found", async () => {
      await createBrand();
      const res = await request(server).get("/api/brand").set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /:brand", () => {
    it("Should return 404 if brand is not found", async () => {
      const res = await request(server).get("/api/brandId").set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if brand is found", async () => {
      brand = await createBrand();
      const res = await request(server)
        .get(`/api/brand/${brand.id}`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /:brand", () => {
    it("Should return 404 if brand is not found", async () => {
      const res = await request(server).get("/api/brandId").set(header);

      expect(res.status).toBe(404);
    });

    it("should return 400 if tag is not an array", async () => {
      const brnd = await createBrand();
      brand.tags = "tag";
      const res = await request(server)
        .patch(`/api/brand/${brnd.id}`)
        .set(header)
        .send(brand);

      expect(res.status).toBe(400);
    });

    it("should return 400 if owner is not an user", async () => {
      const brnd = await createBrand();
      brand.owner = "owner";
      const res = await request(server)
        .patch(`/api/brand/${brnd.id}`)
        .set(header)
        .send(brand);

      expect(res.status).toBe(400);
    });

    it("should return 200 if brand is updated", async () => {
      const brnd = await createBrand();
      const res = await request(server)
        .patch(`/api/brand/${brnd.id}`)
        .set(header)
        .send(brand);

      expect(res.status).toBe(200);
    });
  });

  describe("POST /:brand/favorite", () => {
    it("Should return 404 if brand is not found", async () => {
      const res = await request(server)
        .post("/api/brand/brandId/favorite")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 201 if brand favorited", async () => {
      const brnd = await createBrand();
      const res = await request(server)
        .post(`/api/brand/${brnd.id}/favorite`)
        .set(header);

      expect(res.status).toBe(201);
    });
  });

  describe("POST /:brand/unfavorite", () => {
    it("Should return 404 if brand is not found", async () => {
      const res = await request(server)
        .delete("/api/brand/brandId/unfavorite")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 404 if brand is not favorited", async () => {
      const brnd = await createBrand();
      const res = await request(server)
        .delete(`/api/brand/${brnd.id}/unfavorite`)
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 204 if brand unfavorited", async () => {
      const brnd = await createBrand();
      await favoriteBrand();
      const res = await request(server)
        .delete(`/api/brand/${brnd.id}/unfavorite`)
        .set(header);

      expect(res.status).toBe(204);
    });
  });

  describe("PUT /:brand/upvote", () => {
    it("Should return 404 if brand is not found", async () => {
      const res = await request(server)
        .put("/api/brand/brandId/upvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if brand upvoted", async () => {
      const brnd = await createBrand();
      const res = await request(server)
        .put(`/api/brand/${brnd.id}/upvote`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("PUT /:brand/downvote", () => {
    it("Should return 404 if brand is not found", async () => {
      const res = await request(server)
        .put("/api/brand/brandId/downvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if brand downvoted", async () => {
      const brnd = await createBrand();
      const res = await request(server)
        .put(`/api/brand/${brnd.id}/downvote`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /:brand/unvote", () => {
    it("Should return 404 if brand is not found", async () => {
      const res = await request(server)
        .delete("/api/brand/brandId/unvote")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 204 if brand unvoted", async () => {
      const brnd = await createBrand();
      await upvote();
      const res = await request(server)
        .delete(`/api/brand/${brnd.id}/unvote`)
        .set(header);

      expect(res.status).toBe(204);
    });
  });

  describe("POST /:brand/subscribe", () => {
    it("Should return 404 if brand is not found", async () => {
      const res = await request(server)
        .post("/api/brand/brandId/subscribe")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 400 if already subscribed", async () => {
      const brnd = await createBrand();
      await subscribeBrand();
      const res = await request(server)
        .post(`/api/brand/${brnd.id}/subscribe`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 201 if subscribed to brand", async () => {
      const brnd = await createBrand();
      const res = await request(server)
        .post(`/api/brand/${brnd.id}/subscribe`)
        .set(header);

      expect(res.status).toBe(201);
    });
  });

  describe("DELETE /:brand/unsubscribe", () => {
    it("Should return 404 if brand is not found", async () => {
      const res = await request(server)
        .delete("/api/brand/brandId/unsubscribe")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 400 if brand not subscribed", async () => {
      const brnd = await createBrand();
      const res = await request(server)
        .delete(`/api/brand/${brnd.id}/unsubscribe`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 200 if subscribed to brand", async () => {
      const brnd = await createBrand();
      await subscribeBrand();
      const res = await request(server)
        .delete(`/api/brand/${brnd.id}/unsubscribe`)
        .set(header);

      expect(res.status).toBe(200);
    });
  });

  describe("POST /:brand/comment", () => {
    it("Should return 404 if brand is not found", async () => {
      const res = await request(server)
        .post("/api/brand/brandId/comment")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 400 if comment not provided", async () => {
      const brnd = await createBrand();
      const res = await request(server)
        .post(`/api/brand/${brnd.id}/comment`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 400 if tag is not an array", async () => {
      comment.tags = "tag";
      const brnd = await createBrand();
      const res = await request(server)
        .post(`/api/brand/${brnd.id}/comment`)
        .set(header)
        .send(brand);

      expect(res.status).toBe(400);
    });

    it("Should return 201 if comment successful", async () => {
      const brnd = await createBrand();
      const res = await request(server)
        .post(`/api/brand/${brnd.id}/comment`)
        .set(header)
        .send({
          content: "comment",
          tags: ["tag1", "tag2"],
        });

      expect(res.status).toBe(201);
    });
  });

  describe("POST /:brand/comment/:comment", () => {
    it("Should return 404 if brand not found", async () => {
      const res = await request(server)
        .post("/api/brand/brandId/comment/commentId")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 400 if tag is not an array", async () => {
      const brnd = await createBrand();
      const comnt = createComment(brnd.id);
      const res = await request(server)
        .post(`/api/brand/${brnd.id}/comment/${comnt}`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 400 if comment not provided", async () => {
      const brnd = await createBrand();
      const comnt = createComment(brnd.id);
      const res = await request(server)
        .post(`/api/brand/${brnd.id}/comment/${comnt}`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 201 if comment successful", async () => {
      const brnd = await createBrand();
      const comnt = await createComment(brnd.id);
      const res = await request(server)
        .post(`/api/brand/${brnd.id}/comment/${comnt.id}`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(200);
    });
  });

  describe("GET /:brand/comments", () => {
    it("Should return 404 if brand not found", async () => {
      const res = await request(server)
        .get("/api/brand/brandId/comments")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 200 if comment found", async () => {
      const brnd = await createBrand();
      await createComment(brnd.id);
      const res = await request(server)
        .get(`/api/brand/${brnd.id}/comments`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(200);
    });
  });

  describe("DELETE /comment/:comment", () => {
    it("Should return 404 if comment not found", async () => {
      const res = await request(server)
        .delete("/api/brand/comment/commentId")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 204 if comment deleted", async () => {
      const brnd = await createBrand();
      const comnt = await createComment(brnd.id);
      const res = await request(server)
        .delete(`/api/brand/comment/${comnt.id}`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(204);
    });
  });

  describe("DELETE /:brand", () => {
    it("Should return 404 if comment not found", async () => {
      const res = await request(server)
        .delete("/api/brand/brandId")
        .set(header);

      expect(res.status).toBe(404);
    });

    it("Should return 204 if comment found", async () => {
      const brnd = await createBrand();
      const res = await request(server)
        .delete(`/api/brand/${brnd.id}`)
        .set(header)
        .send(comment);

      expect(res.status).toBe(204);
    });
  });
});
