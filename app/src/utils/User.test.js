const User = require("./User");
const { faker } = require("@faker-js/faker");

describe("User", () => {
  let mockUserData;
  let mockUserReturnValue;

  beforeEach(async () => {
    mockUserData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    mockUserReturnValue = {
      id: jest.fn(),
      name: jest.fn(() => faker.internet.username()),
      email: jest.fn(() => mockUserData.email),
    };
  });

  it("Should return false if password does not match", async () => {
    let user = new User();
    user.email = mockUserData.email;
    user.password = mockUserData.password;

    jest.spyOn(user, "save").mockResolvedValue(mockUserReturnValue);

    user.passwordMatch = jest.fn().mockResolvedValue(false);

    user.password = "wrongpassword";
    const isPassword = await user.passwordMatch();

    expect(isPassword).toBe(false);
  });

  it("Should return true if password match", async () => {
    let user = new User();
    user.email = mockUserData.email;
    user.password = mockUserData.password;

    jest.spyOn(user, "save").mockResolvedValue(mockUserReturnValue);

    user.passwordMatch = jest.fn().mockResolvedValue(true);

    const isPassword = await user.passwordMatch();

    expect(isPassword).toBe(true);
  });

  it("Should return the created user object", async () => {
    let user = new User();
    user.email = mockUserData.email;
    user.password = mockUserData.password;
    user = await user.save();

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("name");
    expect(user.email).toEqual(mockUserData.email);
  });
});
