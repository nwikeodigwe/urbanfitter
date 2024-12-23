const User = require("../../../utils/User");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs/dist/bcrypt");
const app = require("../../../app");
let server;

const prisma = new PrismaClient();

describe("User", () => {
  let user;

  const createUser = async () => {
    const data = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
      },
      select: {
        id: true,
      },
    });

    return data.id;
  };

  beforeEach(async () => {
    server = app.listen(0, () => {
      server.address().port;
    });

    user = {
      id: null,
      name: "name",
      email: "test@test.com",
      password: "password",
    };
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await server.close();
  });

  it("Should return false if password does not match", async () => {
    user.id = await createUser();
    user.password = "wrongPassword";
    let usr = new User(user);
    const isPassword = await usr.passwordMatch();

    expect(isPassword).toBe(false);
  });

  it("Should return true if password match", async () => {
    user.id = await createUser();
    let usr = new User(user);
    const isPassword = await usr.passwordMatch();

    expect(isPassword).toBe(true);
  });
});
