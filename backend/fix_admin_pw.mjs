import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://poojaryykrithika_db_user:gRO2pcZDAQSCs6HQ@bakehub.dx6qwwu.mongodb.net/bakehub?retryWrites=true&w=majority&appName=BakeHub";

await mongoose.connect(MONGO_URI);
console.log("Connected to MongoDB");

const db = mongoose.connection.db;
const users = db.collection("users");

// Reset admin password to a known hash
const newHash = await bcrypt.hash("admin123", 10);
const res = await users.updateOne({ email: "admin@bakehub.com" }, { $set: { password: newHash } });
console.log("Admin password updated:", res.modifiedCount, "doc(s)");

// Verify it works
const admin = await users.findOne({ email: "admin@bakehub.com" });
const ok = await bcrypt.compare("admin123", admin.password);
console.log("Password verify OK:", ok);
console.log("Admin role:", admin.role);

await mongoose.disconnect();
