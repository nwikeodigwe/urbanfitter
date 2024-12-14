const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs/dist/bcrypt");
const app = require("../../../app");
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

  const createToken = () => {
    return prisma.reset.create({
      data: {
        token: "token",
        expires: new Date(Date.now() - 600000),
        user: { connect: { email: user.email } },
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
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await server.close();
  });

  describe("POST /signup", () => {
    afterEach(async () => {
      await prisma.user.deleteMany();
    });

    it("Should return 400 if email and password is invalid", async () => {
      user.email = "";
      const res = await request(server).post("/api/auth/signup").send(user);

      expect(res.status).toBe(400);
    });

    it("Should return 400 if user already exists", async () => {
      await createUser();
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
      await createUser();
      user.password = "invalidpassword";
      const res = await request(server).post("/api/auth/signin").send(user);

      expect(res.status).toBe(400);
    });

    it("Should return 200 if user is found", async () => {
      await createUser();
      const res = await request(server).post("/api/auth/signin").send(user);

      expect(res.status).toBe(200);
    });
  });

  describe("POST /reset", () => {
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
    afterEach(async () => {
      await prisma.user.deleteMany();
    });

    it("should return 400 if token and password is undefined", async () => {
      user.password = "";
      res = await request(server).post(`/api/auth/reset/token`).send(user);

      expect(res.status).toBe(400);
    });

    it("should return 400 if token is invalid", async () => {
      user = await createUser();
      const res = await request(server)
        .post("/api/auth/reset/invalidtoken")
        .send(user);

      expect(res.status).toBe(400);
    });

    it("should return 400 if token is expired", async () => {
      user = await createUser();
      createToken();
      res = await request(server).post("/api/auth/reset/token").send(user);

      expect(res.status).toBe(400);
    });
  });
});
