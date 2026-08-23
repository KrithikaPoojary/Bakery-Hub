import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://poojaryykrithika_db_user:gRO2pcZDAQSCs6HQ@bakehub.dx6qwwu.mongodb.net/bakehub?retryWrites=true&w=majority&appName=BakeHub";

await mongoose.connect(MONGO_URI);
console.log("Connected to MongoDB");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

// Seed admin
const adminEmail = "admin@bakehub.com";
const existing = await User.findOne({ email: adminEmail });
if (existing) {
  console.log("Admin already exists:", existing.email, "role:", existing.role);
} else {
  const hashed = await bcrypt.hash("admin123", 10);
  await User.create({ name: "BakeHub Admin", email: adminEmail, password: hashed, phone: "9000000000", role: "admin" });
  console.log("Admin created: admin@bakehub.com / admin123");
}

// List all users
const users = await User.find({}, "name email role");
console.log("\nAll users in DB:");
users.forEach(u => console.log(` - ${u.email} [${u.role}]`));

await mongoose.disconnect();
console.log("\nDone.");
