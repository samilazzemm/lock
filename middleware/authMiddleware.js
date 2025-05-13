const jwt = require("jsonwebtoken");

module.exports = function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log("📥 Received Authorization Header:", authHeader);

  if (!authHeader) {
    return res.status(403).json({ error: "No token provided" });
  }

  const token = authHeader.split(' ')[1]; // Extract token after "Bearer"
  console.log("📢 Extracted Token:", token);

  if (!token) {
    return res.status(403).json({ error: "Invalid token format" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, user) => {
    if (err) {
      console.error("❌ Token verification failed:", err);
      return res.status(403).json({ error: "Token is invalid or expired" });
    }

    console.log("✅ Token Verified. User Data:", user);
    req.user = user; // Attach user data to request
    next();
  });
};
