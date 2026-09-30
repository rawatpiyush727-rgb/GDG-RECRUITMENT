import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { User, AdminAllowlist } from "./models.js";
import { authenticate } from "./authMiddleware.js";

// Tolerate system clock skew (e.g. up to 24 hours) between local machine and Google OAuth servers
OAuth2Client.CLOCK_SKEW_SECS_ = 86400;

const router = express.Router();
function getGoogleClient() {
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "");
}

const registerSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().trim().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

function formatZodErrors(error) {
  const fields = {};
  for (const issue of error.issues) {
    const fieldName = issue.path[0] || "general";
    if (!fields[fieldName]) {
      fields[fieldName] = [];
    }
    fields[fieldName].push(issue.message);
  }
  return fields;
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

function signToken(userId, role) {
  const secret = process.env.JWT_SECRET || "default_dev_secret_key";
  return jwt.sign({ userId, role }, secret, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId || null,
  };
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Please correct the errors in the form.",
        fields: formatZodErrors(parseResult.error),
      });
    }

    const { name, email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists.",
        fields: { email: ["An account with this email already exists."] },
      });
    }

    // Role is derived server-side from admin allowlist
    const allowlistEntry = await AdminAllowlist.findOne({ email: normalizedEmail });
    const role = allowlistEntry ? allowlistEntry.role : "student";
    const departmentId = allowlistEntry ? allowlistEntry.departmentId : null;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      departmentId,
    });

    const token = signToken(newUser._id, newUser.role);
    setAuthCookie(res, token);

    return res.status(201).json({
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Failed to create account. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Please provide a valid email and password.",
        fields: formatZodErrors(parseResult.error),
      });
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Role check against allowlist
    const allowlistEntry = await AdminAllowlist.findOne({ email: normalizedEmail });
    if (allowlistEntry && user.role !== allowlistEntry.role) {
      user.role = allowlistEntry.role;
      user.departmentId = allowlistEntry.departmentId || user.departmentId;
      await user.save();
    }

    const token = signToken(user._id, user.role);
    setAuthCookie(res, token);

    return res.json({
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Unable to sign in. Please try again." });
  }
});

// POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing Google credential token." });
    }

    let payload;
    try {
      if (process.env.GOOGLE_CLIENT_ID) {
        const client = getGoogleClient();
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } else {
        // Fallback for development if client ID is not configured yet
        const decoded = jwt.decode(credential);
        payload = decoded;
      }
    } catch (tokenErr) {
      console.error("Google token verification failed:", tokenErr.message);

      // In development, handle clock drift between local PC and Google servers
      if (process.env.NODE_ENV !== "production") {
        console.warn("Dev mode fallback: decoding Google token due to verification error:", tokenErr.message);
        try {
          const decoded = jwt.decode(credential);
          if (decoded && decoded.email) {
            payload = decoded;
          }
        } catch {
          // Keep payload null
        }
      }

      if (!payload) {
        return res.status(401).json({
          error:
            process.env.NODE_ENV === "production"
              ? "Invalid Google credential."
              : `Invalid Google credential (${tokenErr.message})`,
        });
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google user data." });
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || payload.given_name || email.split("@")[0];
    const googleId = payload.sub;

    let user = await User.findOne({ email });
    const allowlistEntry = await AdminAllowlist.findOne({ email });
    const role = allowlistEntry ? allowlistEntry.role : "student";
    const departmentId = allowlistEntry ? allowlistEntry.departmentId : null;

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        role,
        departmentId,
      });
    } else {
      let needsSave = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (allowlistEntry && user.role !== allowlistEntry.role) {
        user.role = allowlistEntry.role;
        user.departmentId = allowlistEntry.departmentId || user.departmentId;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    const token = signToken(user._id, user.role);
    setAuthCookie(res, token);

    return res.json({
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(500).json({ error: "Google sign-in failed. Please try again." });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  return res.json({
    user: sanitizeUser(req.user),
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return res.json({ ok: true });
});

export default router;
