require("dotenv").config();
const auth = require("./auth");
const jwt = require("jsonwebtoken");

describe("Auth middleware", () => {
  let user;
  let token;
  let req;
  let res;
  let next;

  beforeEach(() => {
    user = {
      id: 1,
      name: "test",
      email: "test@example.com",
    };

    token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

    req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    next = jest.fn();
  });
  it("Should return 401 if no token is provided", () => {
    const req = {
      headers: {},
    };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Access denied" });
  });

  it("Should return 403 if token is invalid", () => {
    req = { headers: { authorization: "Bearer invalidtoken" } };

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("Should populate req.user with the payload of a valid JWT", () => {
    res = {};

    auth(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user).toMatchObject(user);
    expect(next).toHaveBeenCalled();
  });
});
