const request = require("supertest");
const { PrismaClient } = require("@prisma/client");
const app = require("../../../app");
let server;

const prisma = new PrismaClient();

describe("Brand route", () => {
  let user;
  let brand;
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
});
