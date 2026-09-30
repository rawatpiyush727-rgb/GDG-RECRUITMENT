import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "departmentAdmin", "superadmin"],
      default: "student",
    },
    departmentId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const adminAllowlistSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["departmentAdmin", "superadmin"],
      required: true,
    },
    departmentId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    departmentId: {
      type: String,
      required: true,
    },
    departmentName: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "accepted", "rejected"],
      default: "pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    yearOfStudy: {
      type: String,
      default: "",
    },
    portfolioUrl: {
      type: String,
      default: "",
    },
    statement: {
      type: String,
      default: "",
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        note: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    scope: { type: String, enum: ["global", "department"], required: true, default: "global" },
    departmentId: { type: String, default: null }, // slug e.g. "dsa", "web", null when global
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const AdminAllowlist =
  mongoose.models.AdminAllowlist || mongoose.model("AdminAllowlist", adminAllowlistSchema);
export const Application =
  mongoose.models.Application || mongoose.model("Application", applicationSchema);
export const Announcement =
  mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);

export default {
  User,
  AdminAllowlist,
  Application,
  Announcement,
};
