require("dotenv").config();
const auth = require("../../../middleware/auth");
const jwt = require("jsonwebtoken");

describe("Auth middleware", () => {
  it("Should return 401 if no token is provided", () => {
    const req = {
      headers: {},
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Access denied" });
  });

  it("Should return 403 if token is invalid", () => {
    const req = {
      headers: {
        authorization: "Bearer invalidtoken",
      },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("Should populate req.user with the payload of a valid JWT", () => {
    const user = {
      id: 1,
      name: "test",
      email: "test@example.com",
    };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user).toMatchObject(user);
    expect(next).toHaveBeenCalled();
  });
});
