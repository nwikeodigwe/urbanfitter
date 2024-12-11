const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs/dist/bcrypt");
const app = require("../../../app");
const { create } = require("handlebars");
let server;

const prisma = new PrismaClient();

describe("Auth route", () => {
  let user;

  const createUser = () => {
    return prisma.user.create({
      data: {
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
      },
    });
  };

  beforeAll(async () => {
    server = app.listen(0, () => {
      const port = server.address().port;
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await server.close();
  });

  describe("POST /signup", () => {
    beforeEach(async () => {
      user = {
        email: "test@email.com",
        password: "password",
      };

      await createUser();
    });

    afterEach(async () => {
      await prisma.user.deleteMany();
    });

    it("Should return 400 if email and password is invalid", async () => {
      user.email = "";
      const res = await request(server).post("/api/auth/signup").send(user);

      expect(res.status).toBe(400);
    });

    it("Should return 400 if user already exists", async () => {
      const res = await request(server).post("/api/auth/signup").send(user);

      expect(res.status).toBe(400);
    });

    it("Should return 200 if user is created", async () => {
      user.email = "test@test.com";
      const res = await request(server).post("/api/auth/signup").send(user);
      expect(res.status).toBe(200);
    });
  });

  describe("POST /signin", () => {
    beforeEach(async () => {
      user = {
        email: "test@email.com",
        password: "password",
      };

      await createUser();
    });

    afterEach(async () => {
      await prisma.user.deleteMany();
    });

    it("Should return 400 if email and password is invalid", async () => {
      user.email = "";
      const res = await request(server).post("/api/auth/signup").send(user);

      expect(res.status).toBe(400);
    });

    it("Should return 404 if user is not found", async () => {
      user.email = "invalidemail@test.com";
      const res = await request(server).post("/api/auth/signin").send(user);

      expect(res.status).toBe(404);
    });

    it("Should return 400 if password is invalid", async () => {
      user.password = "invalidpassword";
      const res = await request(server).post("/api/auth/signin").send(user);

      expect(res.status).toBe(400);
    });

    it("Should return 200 if user is found", async () => {
      const res = await request(server).post("/api/auth/signin").send(user);

      expect(res.status).toBe(200);
    });
  });

  describe("POST /reset", () => {
    beforeEach(async () => {
      user = {
        email: "test@email.com",
        password: "password",
      };
    });

    afterEach(async () => {
      await prisma.user.deleteMany();
    });

    it("should return 400 if email is invalid", async () => {
      user.email = "";
      const res = await request(server).post("/api/auth/reset").send(user);

      expect(res.status).toBe(400);
    });

    it("should return 404 if user is not found", async () => {
      const res = await request(server).post("/api/auth/reset").send(user);

      expect(res.status).toBe(404);
    });

    it("should return 200 if user is found", async () => {
      await createUser();
      const res = await request(server).post("/api/auth/reset").send(user);

      expect(res.status).toBe(200);
    });
  });

  describe("POST /reset/:token", () => {
    function createToken(userId, expires = new Date()) {
      return prisma.reset.create({
        data: {
          token: "token",
          expires,
          userId,
        },
      });
    }

    beforeEach(async () => {
      user = {
        email: "test@email.com",
        password: "password",
      };
    });

    afterEach(async () => {
      user = {
        email: "test@email.com",
        password: "password",
      };
      await prisma.user.deleteMany();
      await prisma.reset.deleteMany();
    });

    it("should return 400 if token and password is undefined", async () => {
      user.password = "";
      res = await request(server).post(`/api/auth/reset/token`).send(user);

      expect(res.status).toBe(400);
    });

    it("should return 400 if token is invalid", async () => {
      const createdUser = await createUser();
      await createToken(createdUser.id);
      const res = await request(server)
        .post("/api/auth/reset/invalidtoken")
        .send(user);

      expect(res.status).toBe(400);
    });

    it("should return 400 if token is expired", async () => {
      const createdUser = await createUser();
      createToken(createdUser.id, new Date(Date.now() - 600000));
      res = await request(server).post("/api/auth/reset/token").send(user);

      expect(res.status).toBe(400);
    });
  });
});
