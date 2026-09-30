import dotenv from "dotenv";
import mongoose from "mongoose";
import { AdminAllowlist, User } from "./models.js";

dotenv.config();

const email = (process.argv[2] || "admin@gdg.org").toLowerCase().trim();
const role = process.argv[3] || "superadmin";
const departmentId = process.argv[4] || null;

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Error: MONGODB_URI not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for admin seeding...");

    const allowlistEntry = await AdminAllowlist.findOneAndUpdate(
      { email },
      { email, role, departmentId },
      { upsert: true, returnDocument: "after" }
    );

    console.log(`Admin allowlist updated for: ${allowlistEntry.email} with role: ${allowlistEntry.role}`);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.role = role;
      if (departmentId) existingUser.departmentId = departmentId;
      await existingUser.save();
      console.log(`Existing user ${email} updated to role: ${role}`);
    } else {
      console.log(`Note: User account for ${email} has not registered yet. When they register/sign in, they will automatically receive role: ${role}`);
    }

    console.log("Admin seed completed successfully.");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
