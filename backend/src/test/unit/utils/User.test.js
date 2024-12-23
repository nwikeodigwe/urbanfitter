const User = require("../../../utils/User");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs/dist/bcrypt");

const prisma = new PrismaClient();

describe("User", () => {
  let mockUserData;

  const createUser = async () => {
    const data = await prisma.user.create({
      data: {
        name: mockUserData.name,
        email: mockUserData.email,
        password: bcrypt.hashSync(mockUserData.password, 10),
      },
      select: {
        id: true,
      },
    });

    return data.id;
  };

  beforeEach(async () => {
    mockUserData = {
      name: "name",
      email: "test@test.com",
      password: "password",
    };
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("Should return false if password does not match", async () => {
    mockUserData.id = await createUser();
    let user = new User({ ...mockUserData, password: "wrongPassword" });
    const isPassword = await user.passwordMatch();

    expect(isPassword).toBe(false);
  });

  it("Should return true if password match", async () => {
    mockUserData.id = await createUser();
    let user = new User(mockUserData);
    const isPassword = await user.passwordMatch();

    expect(isPassword).toBe(true);
  });

  it("Should return the created user object", async () => {
    const mockCreatedUser = { id: "1", name: "name", email: "test@test.com" };

    jest.spyOn(prisma.user, "create").mockResolvedValue(mockCreatedUser);

    const mockUserData = {
      name: "name",
      email: "test@test.com",
      password: "password",
    };

    const user = new User(mockUserData);
    const usr = await user.save();

    expect(usr).toEqual({ ...mockCreatedUser, id: expect.any(String) });

    // expect(prisma.user.create).toHaveBeenCalledWith({
    //   data: {
    //     name: mockUserData.name,
    //     email: mockUserData.email,
    //     password: expect.any(String),
    //   },
    // });
    // prisma.user.create.mockRestore();
  });
});
