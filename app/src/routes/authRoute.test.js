const app = require("../app");
const request = require("supertest");
const prisma = require("../functions/prisma");
const { faker } = require("@faker-js/faker");
const { status } = require("http-status");
const method = require("../const/http-methods");

const {
  createTestUser,
  response,
  createTestResetToken,
} = require("../functions/testHelpers");
let server;

describe("Auth route", () => {
  let user;
  let mockResponse;
  let token;

  beforeAll(async () => {
    server = app.listen(0, () => {
      server.address().port;
    });

    const { account } = await createTestUser();
    user = account;

    const reset = await createTestResetToken(user.email);
    token = reset.token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await server.close();
  });

  describe("POST /signup", () => {
    it("Should return 400 if email and password is invalid", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/auth/signup")
        .send({ email: "", password: "" });

      expect(res.status).toBe(400);
    });

    it("Should return 400 if user already exists", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/auth/signup")
        .send({ email: user.email });
      expect(res.status).toBe(400);
    });

    it("Should return 200 if user is created", async () => {
      mockResponse = response(status.OK, status[status.OK]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server).post("/api/auth/signup").send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /signin", () => {
    it("Should return 400 if email and password is invalid", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/auth/signup")
        .send({ email: "" });

      expect(res.status).toBe(400);
    });

    it("Should return 404 if user is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/auth/signin")
        .send({ email: "invalid_email", password: user.password });

      expect(res.status).toBe(404);
    });

    it("Should return 400 if password is invalid", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/auth/signin")
        .send({ email: user.email, password: "invalid_password" });
      expect(res.status).toBe(400);
    });

    it("Should return 200 if user is found", async () => {
      mockResponse = response(status.OK, status[status.OK]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/auth/signin")
        .send({ email: user.email, password: user.password });

      expect(res.status).toBe(200);
    });
  });

  describe("POST /reset", () => {
    it("should return 400 if email is invalid", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server).post("/api/auth/reset");

      expect(res.status).toBe(400);
    });

    it("should return 404 if user is not found", async () => {
      mockResponse = response(status.NOT_FOUND, status[status.NOT_FOUND]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/auth/reset")
        .send({ email: "random_email@email.com" });

      expect(res.status).toBe(404);
    });

    it("should return 200 if reset successful", async () => {
      mockResponse = response(status.OK, status[status.OK]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server)
        .post("/api/auth/reset")
        .send({ email: user.email });
      expect(res.status).toBe(200);
    });
  });

  describe("POST /reset/:token", () => {
    it("should return 400 if token or password is undefined", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      res = await request(server).post(`/api/auth/reset/undefined_token`);

      expect(res.status).toBe(400);
    });

    it("should return 400 if token is invalid", async () => {
      mockResponse = response(status.BAD_REQUEST, status[status.BAD_REQUEST]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      const res = await request(server).post("/api/auth/reset/invalid_token");

      expect(res.status).toBe(400);
    });

    it("should return 200 if password reset", async () => {
      mockResponse = response(status.OK, status[status.OK]);

      jest.spyOn(request(server), method.POST).mockReturnValue(mockResponse);
      res = await request(server)
        .post(`/api/auth/reset/${token}`)
        .send({ password: faker.internet.password() });

      expect(res.status).toBe(200);
    });
  });
});
