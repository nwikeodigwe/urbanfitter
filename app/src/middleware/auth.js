const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers["Authorization"]?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ error: "Invalid authorization token" });
    req.user = user;
    next();
  });
};
