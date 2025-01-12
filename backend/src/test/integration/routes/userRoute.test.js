const request = require("supertest");
const app = require("../../../app");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs/dist/bcrypt");
let server;

const prisma = new PrismaClient();

describe("User route", () => {
  let user;
  let user2;
  let token;
  let header;
  let passwordReset;

  const auth = async () => {
    const res = await request(server).post("/api/auth/signup").send(user);
    return res.body.token;
  };

  const createUser = () => {
    return prisma.user.create({
      data: {
        email: user2.email,
        password: bcrypt.hashSync(user.password, 10),
      },
    });
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
        collection: { connect: { id: collectionId } },
        author: { connect: { email: user.email } },
      },
    });

    return stle.id;
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

  const createSubscription = () => {
    return prisma.userSubscription.create({
      data: {
        subscriber: {
          connect: { email: user.email },
        },
        user: { connect: { email: user2.email } },
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

    user2 = {
      email: "test2@email.com",
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
    await prisma.$disconnect();
    await server.close();
  });

  describe("GET /", () => {
    it("Should return 404 if no user is found", async () => {
      const res = await request(server).get("/api/user").set(header);
      expect(res.status).toBe(404);
    });

    it("Should return 200 if token is valid", async () => {
      await createUser();
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
      user = await createUser();
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
      user.email = user2.email;
      user = await createUser();
      user.email = "test@email.com";
      await createSubscription();
      const res = await request(server)
        .post(`/api/user/${user.id}/subscribe`)
        .set(header);

      expect(res.status).toBe(400);
    });

    it("Should return 201 if subscription successful", async () => {
      user = await createUser();
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
      const user = await createUser();
      const res = await request(server)
        .delete(`/api/user/${user.id}/unsubscribe`)
        .set(header);
      expect(res.status).toBe(400);
    });

    it("Should return 200 if unsubscribed", async () => {
      const user = await createUser();
      await createSubscription();
      const res = await request(server)
        .delete(`/api/user/${user.id}/unsubscribe`)
        .set(header);
      expect(res.status).toBe(200);
    });
  });

  describe("GET /me", () => {
    it("should return 404 if user not found", async () => {
      await prisma.user.deleteMany();
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
      user = await createUser();
      const res = await request(server)
        .get(`/api/${user.id}/style`)
        .set(header);
      expect(res.status).toBe(404);
    });

    it("should return 200 if style found", async () => {
      user = await createUser();
      collection = await createCollection();
      await createStyle(collection);
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
      user = await createUser();
      const res = await request(server)
        .get(`/api/${user.id}/collection`)
        .set(header);
      expect(res.status).toBe(404);
    });

    it("should return 200 if style found", async () => {
      user = await createUser();
      await createCollection();
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
        newpassword: "newPassword",
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
