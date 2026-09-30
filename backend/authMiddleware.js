import jwt from "jsonwebtoken";
import { User, AdminAllowlist } from "./models.js";

export async function authenticate(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      return res.status(401).json({ error: "Please sign in to continue." });
    }

    const secret = process.env.JWT_SECRET || "default_dev_secret_key";
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      return res.status(401).json({ error: "Session expired or invalid. Please sign in again." });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Account not found." });
    }

    // Ensure role is up-to-date with AdminAllowlist
    const allowlistEntry = await AdminAllowlist.findOne({ email: user.email });
    if (allowlistEntry && user.role !== allowlistEntry.role) {
      user.role = allowlistEntry.role;
      user.departmentId = allowlistEntry.departmentId || user.departmentId;
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "Authentication check failed." });
  }
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Please sign in to continue." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have access to that page." });
    }

    next();
  };
}

export const requireAdmin = requireRole(["departmentAdmin", "superadmin"]);
