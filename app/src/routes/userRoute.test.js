const request = require("supertest");
const app = require("../app");
const User = require("../utils/User");
const Collection = require("../utils/Collection");
const Style = require("../utils/Style");
const { faker } = require("@faker-js/faker");
const { PrismaClient } = require("@prisma/client");
const { status } = require("http-status");
let server;

const prisma = new PrismaClient();

describe("User route", () => {
  let header;
  let user;
  let collection;
  let style;

  beforeEach(async () => {
    server = app.listen(0, () => {
      server.address().port;
    });

    user = new User();
    user.email = faker.internet.email();
    user.password = faker.internet.password();
    await user.save();
    const { token } = await user.login();
    header = { Authorization: `Bearer ${token}` };

    collection = new Collection();
    collection.name = faker.commerce.product();
    collection.description = faker.commerce.productDescription();
    collection.authorId = user.id;
    collection.tags = ["tag1", "tag2"];
    await collection.save();

    style = new Style();
    style.name = faker.commerce.productName();
    style.description = faker.commerce.productDescription();
    style.author = user.id;
    style.tags = ["tag1", "tag2"];
    style.collectionId = collection.id;
    await style.save();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.$disconnect();
    await server.close();
  });

  describe("GET /", () => {
    it("Should return 404_NOT_FOUND if no user is found", async () => {
      await user.deleteMany();
      const res = await request(server).get("/api/user").set(header);
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("Should return 200 if token is valid", async () => {
      const res = await request(server).get("/api/user").set(header);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /:user", () => {
    it("Should return 404 if user not found", async () => {
      const res = await request(server).get("/api/user/userId").set(header);
      expect(res.status).toBe(404);
    });

    it("Should return 200 if user found", async () => {
      const res = await request(server).get(`/api/user/${user.id}`).set(header);
      expect(res.status).toBe(200);
    });
  });

  describe("POST /:user/subscribe", () => {
    it("Should return 404 if user not found", async () => {
      const res = await request(server)
        .post(`/api/user/userId/subscribe`)
        .set(header);
      expect(res.status).toBe(404);
    });

    it("Should return 400 if already subscribed", async () => {
      let user2 = new User();
      user2.email = faker.internet.email();
      user2.password = faker.internet.password();
      user2 = await user.save();
      await user.subscribeTo(user2.id);
      const res = await request(server)
        .post(`/api/user/${user2.id}/subscribe`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 201 if subscription successful", async () => {
      const res = await request(server)
        .post(`/api/user/${user.id}/subscribe`)
        .set(header);
      expect(res.status).toBe(201);
    });
  });

  describe("DELETE /:user/unsubscribe", () => {
    it("Should return 404 if user not found", async () => {
      const res = await request(server)
        .delete(`/api/user/cm431qxul0007hgi64pcv9mzz/unsubscribe`)
        .set(header);
      expect(res.status).toBe(404);
    });

    it("Should return 400 if not subscribed", async () => {
      const res = await request(server)
        .delete(`/api/user/${user.id}/unsubscribe`)
        .set(header);
      expect(res.status).toBe(400);
    });

    it("Should return 200 if unsubscribed", async () => {
      let user2 = new User();
      user2.email = faker.internet.email();
      user2.password = faker.internet.password();
      user2 = await user.save();
      await user.subscribeTo(user2.id);
      const res = await request(server)
        .delete(`/api/user/${user2.id}/unsubscribe`)
        .set(header);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /me", () => {
    it("should return 404 if user not found", async () => {
      await user.delete(user.id);
      const res = await request(server).get("/api/user/me").set(header);
      expect(res.status).toBe(404);
    });

    it("should return 200 if user exist", async () => {
      const res = await request(server).get("/api/user/me").set(header);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /:user/style", () => {
    it("should return 404 if user not found", async () => {
      const res = await request(server).get("/api/userId/style").set(header);
      expect(res.status).toBe(404);
    });

    it("should return 404 if no style found", async () => {
      const res = await request(server)
        .get(`/api/${user.id}/style`)
        .set(header);
      expect(res.status).toBe(404);
    });

    it("should return 200 if style found", async () => {
      const res = await request(server)
        .get(`/api/${user.id}/style`)
        .set(header);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /:user/collection", () => {
    it("should return 404 if user not found", async () => {
      const res = await request(server)
        .get("/api/userId/collection")
        .set(header);
      expect(res.status).toBe(404);
    });

    it("should return 404 if no collection found", async () => {
      const res = await request(server)
        .get(`/api/${user.id}/collection`)
        .set(header);
      expect(res.status).toBe(404);
    });

    it("should return 200 if style found", async () => {
      const res = await request(server)
        .get(`/api/${user.id}/collection`)
        .set(header);
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /me", () => {
    it("should return 200 if data updated", async () => {
      const updateData = {
        name: "updatedname",
        email: "updatedemail@example.com",
      };
      const res = await request(server)
        .patch("/api/user/me")
        .set(header)
        .send(updateData);
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /profile", () => {
    it("Should return 200 if profile updated", async () => {
      const updatedProfile = {
        firstname: "firstname",
        lastname: "lastname",
        bio: "bio",
      };

      const res = await request(server)
        .patch("/api/user/profile")
        .set(header)
        .send(updatedProfile);
      expect(res.status).toBe(200);
    });
  });

  describe("PATCH /password", () => {
    beforeEach(() => {
      passwordReset = {
        password: user.password,
        newpassword: faker.internet.password(),
      };
    });

    it("should return 400 if password is invalid", async () => {
      passwordReset.password = "wrongpassword";
      const res = await request(server)
        .patch("/api/user/password")
        .set(header)
        .send(passwordReset);

      expect(res.status).toBe(400);
    });

    it("Should return 200 if password is updated", async () => {
      const res = await request(server)
        .patch("/api/user/password")
        .set(header)
        .send(passwordReset);

      expect(res.status).toBe(200);
    });
  });
});
