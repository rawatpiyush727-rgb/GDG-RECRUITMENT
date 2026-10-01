import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRoutes from "./authRoutes.js";
import { authenticate, requireAdmin } from "./authMiddleware.js";
import { Application, User, Announcement } from "./models.js";


const app = express();
const PORT = process.env.PORT || 5000;

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "http://localhost:3000",
  "https://gdg-on-campus-ro3c.onrender.com",
];

const parseOrigins = (raw) => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
};

const envOrigins = parseOrigins(process.env.FRONTEND_URL);

const allowedOrigins = Array.from(
  new Set([
    ...defaultAllowedOrigins.map((origin) => origin.replace(/\/+$/, "")),
    ...envOrigins,
  ])
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, or server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    const cleanOrigin = origin.replace(/\/+$/, "");
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes(cleanOrigin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  optionsSuccessStatus: 204,
};

// CORS configuration supporting Vite dev server & production client with credentials
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Gentle rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests. Please try again in a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint required by verification step 5
app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  return res.json({
    ok: true,
    dbConnected: isConnected,
  });
});

// Authentication routes
app.use("/api/auth", authLimiter, authRoutes);

// Applications endpoints
app.get("/api/applications/mine", authenticate, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(apps);
  } catch (err) {
    console.error("Failed to fetch applications:", err);
    return res.status(500).json({ error: "Failed to fetch your applications." });
  }
});

app.post("/api/applications", authenticate, async (req, res) => {
  try {
    const { departmentId, departmentName, yearOfStudy, portfolioUrl, statement, ...extra } =
      req.body;

    if (!departmentId) {
      return res.status(400).json({ error: "Department ID is required." });
    }

    const application = await Application.findOneAndUpdate(
      { userId: req.user._id, departmentId },
      {
        userId: req.user._id,
        departmentId,
        departmentName: departmentName || departmentId,
        yearOfStudy: yearOfStudy || "",
        portfolioUrl: portfolioUrl || "",
        statement: statement || "",
        formData: extra,
        appliedDate: new Date(),
      },
      { upsert: true, returnDocument: "after" }
    );

    return res.status(201).json(application);
  } catch (err) {
    console.error("Failed to submit application:", err);
    return res.status(500).json({ error: "Could not submit application. Please try again." });
  }
});

// Admin stats endpoint
app.get("/api/admin/stats", authenticate, requireAdmin, async (req, res) => {
  try {
    const isDeptAdmin = req.user.role === "departmentAdmin";
    const filter = isDeptAdmin && req.user.departmentId ? { departmentId: req.user.departmentId } : {};

    const totalStudents = await User.countDocuments({ role: "student" });
    const totalApplications = await Application.countDocuments(filter);

    const pending = await Application.countDocuments({ ...filter, status: "pending" });
    const underReview = await Application.countDocuments({ ...filter, status: "under_review" });
    const accepted = await Application.countDocuments({ ...filter, status: "accepted" });
    const rejected = await Application.countDocuments({ ...filter, status: "rejected" });

    // Compute department-level counts for department management table
    const allApps = await Application.find(filter).select("departmentId status");
    const deptCounts = {};
    for (const app of allApps) {
      const dept = app.departmentId;
      if (!deptCounts[dept]) {
        deptCounts[dept] = { total: 0, pending: 0, accepted: 0, rejected: 0 };
      }
      deptCounts[dept].total += 1;
      if (app.status === "pending" || app.status === "under_review") {
        deptCounts[dept].pending += 1;
      } else if (app.status === "accepted") {
        deptCounts[dept].accepted += 1;
      } else if (app.status === "rejected") {
        deptCounts[dept].rejected += 1;
      }
    }

    return res.json({
      totalStudents,
      totalApplications,
      breakdown: {
        pending: pending + underReview,
        under_review: underReview,
        accepted,
        rejected,
      },
      deptCounts,
    });
  } catch (err) {
    console.error("Failed to fetch admin stats:", err);
    return res.status(500).json({ error: "Failed to load dashboard statistics." });
  }
});

// Admin Applications list (scoped by departmentAdmin vs superadmin)
// GET /api/applications?departmentId=&status=&search=
app.get("/api/applications", authenticate, requireAdmin, async (req, res) => {
  try {
    const isDeptAdmin = req.user.role === "departmentAdmin";
    const query = {};

    // Scoping check
    if (isDeptAdmin) {
      query.departmentId = req.user.departmentId;
    } else if (req.query.departmentId && req.query.departmentId !== "all") {
      query.departmentId = req.query.departmentId;
    }

    // Status filter
    if (req.query.status && req.query.status !== "all") {
      const st = req.query.status.toLowerCase();
      if (st === "pending") {
        query.status = { $in: ["pending", "under_review"] };
      } else {
        query.status = st;
      }
    }

    // Search filter (name or email)
    if (req.query.search && req.query.search.trim()) {
      const term = req.query.search.trim();
      const matchedUsers = await User.find({
        $or: [
          { name: { $regex: term, $options: "i" } },
          { email: { $regex: term, $options: "i" } },
        ],
      }).select("_id");

      const matchedUserIds = matchedUsers.map((u) => u._id);
      query.$or = [
        { userId: { $in: matchedUserIds } },
        { statement: { $regex: term, $options: "i" } },
        { departmentName: { $regex: term, $options: "i" } },
      ];
    }

    const applications = await Application.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.json(applications);
  } catch (err) {
    console.error("Failed to fetch applications list:", err);
    return res.status(500).json({ error: "Failed to fetch applications." });
  }
});

// Admin Application status update (scoped, appends to statusHistory)
// PATCH /api/applications/:id/status
app.patch("/api/applications/:id/status", authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ["pending", "under_review", "accepted", "rejected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value provided." });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    // Scoping check for departmentAdmin
    if (
      req.user.role === "departmentAdmin" &&
      application.departmentId !== req.user.departmentId
    ) {
      return res
        .status(403)
        .json({ error: "You do not have access to manage this department's applications." });
    }

    // Update status and append to statusHistory
    application.status = status;
    if (!Array.isArray(application.statusHistory)) {
      application.statusHistory = [];
    }

    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      note: note || `Status updated to ${status} by ${req.user.name || "Admin"}`,
    });

    await application.save();
    await application.populate("userId", "name email");

    return res.json(application);
  } catch (err) {
    console.error("Failed to update application status:", err);
    return res.status(500).json({ error: "Failed to update application status." });
  }
});

// ─── Announcement Endpoints ───────────────────────────────────────────────────

// POST /api/announcements (admin only)
app.post("/api/announcements", authenticate, requireAdmin, async (req, res) => {
  try {
    let { title, body, scope, departmentId } = req.body;

    if (!title || typeof title !== "string" || title.trim().length < 3 || title.trim().length > 120) {
      return res.status(400).json({ error: "Title must be between 3 and 120 characters." });
    }

    if (!body || typeof body !== "string" || body.trim().length === 0 || body.trim().length > 2000) {
      return res.status(400).json({ error: "Body is required and must not exceed 2000 characters." });
    }

    title = title.trim();
    body = body.trim();

    // Server-side enforcement: do NOT trust scope/dept from departmentAdmin
    if (req.user.role === "departmentAdmin") {
      scope = "department";
      departmentId = req.user.departmentId;
    } else {
      // superadmin
      if (scope === "department") {
        if (!departmentId || typeof departmentId !== "string" || !departmentId.trim()) {
          return res.status(400).json({ error: "A department is required when scope is department." });
        }
        departmentId = departmentId.trim();
      } else {
        scope = "global";
        departmentId = null;
      }
    }

    const announcement = await Announcement.create({
      title,
      body,
      scope,
      departmentId,
      createdBy: req.user._id,
    });

    await announcement.populate("createdBy", "name email");

    return res.status(201).json(announcement);
  } catch (err) {
    console.error("Failed to create announcement:", err);
    return res.status(500).json({ error: "Failed to create announcement." });
  }
});

// GET /api/announcements?departmentId= (admin only — management list)
app.get("/api/announcements", authenticate, requireAdmin, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "departmentAdmin") {
      // Force to own department, ignoring query param
      filter = { scope: "department", departmentId: req.user.departmentId };
    } else {
      // superadmin
      if (req.query.departmentId && req.query.departmentId !== "all") {
        if (req.query.departmentId === "global") {
          filter = { scope: "global" };
        } else {
          filter = { scope: "department", departmentId: req.query.departmentId };
        }
      }
    }

    const announcements = await Announcement.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.json(announcements);
  } catch (err) {
    console.error("Failed to fetch announcements:", err);
    return res.status(500).json({ error: "Failed to fetch announcements." });
  }
});

// PATCH /api/announcements/:id (admin only)
app.patch("/api/announcements/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    // Access control: superadmin may edit anything;
    // departmentAdmin may only edit if announcement.scope === 'department' and matches their own departmentId
    if (req.user.role === "departmentAdmin") {
      if (announcement.scope !== "department" || announcement.departmentId !== req.user.departmentId) {
        return res.status(403).json({ error: "You do not have permission to modify this announcement." });
      }
    }

    const { title, body, scope, departmentId } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 120) {
        return res.status(400).json({ error: "Title must be between 3 and 120 characters." });
      }
      announcement.title = title.trim();
    }

    if (body !== undefined) {
      if (typeof body !== "string" || body.trim().length === 0 || body.trim().length > 2000) {
        return res.status(400).json({ error: "Body is required and must not exceed 2000 characters." });
      }
      announcement.body = body.trim();
    }

    // Only superadmin can change scope / departmentId
    if (req.user.role === "superadmin") {
      if (scope !== undefined) {
        if (scope === "department") {
          if (!departmentId) {
            return res.status(400).json({ error: "Department is required when scope is department." });
          }
          announcement.scope = "department";
          announcement.departmentId = departmentId;
        } else if (scope === "global") {
          announcement.scope = "global";
          announcement.departmentId = null;
        }
      } else if (announcement.scope === "department" && departmentId !== undefined) {
        announcement.departmentId = departmentId;
      }
    }

    await announcement.save();
    await announcement.populate("createdBy", "name email");

    return res.json(announcement);
  } catch (err) {
    console.error("Failed to update announcement:", err);
    return res.status(500).json({ error: "Failed to update announcement." });
  }
});

// DELETE /api/announcements/:id (admin only)
app.delete("/api/announcements/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    // Access control
    if (req.user.role === "departmentAdmin") {
      if (announcement.scope !== "department" || announcement.departmentId !== req.user.departmentId) {
        return res.status(403).json({ error: "You do not have permission to delete this announcement." });
      }
    }

    await Announcement.findByIdAndDelete(req.params.id);
    return res.json({ message: "Announcement deleted successfully." });
  } catch (err) {
    console.error("Failed to delete announcement:", err);
    return res.status(500).json({ error: "Failed to delete announcement." });
  }
});

// GET /api/announcements/mine (any signed-in student/user)
app.get("/api/announcements/mine", authenticate, async (req, res) => {
  try {
    // Find all applications for current user (any status: pending, accepted, rejected all count)
    const userApps = await Application.find({ userId: req.user._id }).select("departmentId");
    const userDeptIds = [...new Set(userApps.map((a) => a.departmentId).filter(Boolean))];

    const announcements = await Announcement.find({
      $or: [
        { scope: "global" },
        { scope: "department", departmentId: { $in: userDeptIds } },
      ],
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    return res.json(announcements);
  } catch (err) {
    console.error("Failed to fetch student announcements:", err);
    return res.status(500).json({ error: "Failed to load announcements." });
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error("Internal server error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.expose || status < 500 ? err.message : "Server error. Please try again shortly.";
  res.status(status).json({ error: message });
});

// MongoDB Connection and server startup
async function startServer() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("ERROR: MONGODB_URI is not set in backend .env file!");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas successfully.");
  } catch (mongoErr) {
    console.error("MongoDB connection error:", mongoErr.message);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

startServer();
