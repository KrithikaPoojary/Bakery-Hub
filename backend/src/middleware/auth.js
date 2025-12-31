import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ----------------------------------------
// MAIN AUTH (verify JWT token)
// ----------------------------------------
export const auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FIXED: Use decoded.id (NOT decoded.sub)
    req.user = await User.findById(decoded.id).select("_id role name email");

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ----------------------------------------
// ROLE BASED ACCESS
// ----------------------------------------
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
};

export const isOwner = (req, res, next) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ error: "Owner access only" });
  }
  next();
};

// ----------------------------------------
// ALIASES — for compatibility
// ----------------------------------------
export const requireAuth = auth;

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};
