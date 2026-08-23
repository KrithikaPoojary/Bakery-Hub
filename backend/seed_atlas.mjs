import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ATLAS_URI = "mongodb+srv://poojaryykrithika_db_user:gRO2pcZDAQSCs6HQ@bakehub.dx6qwwu.mongodb.net/bakehub?retryWrites=true&w=majority&appName=BakeHub";

await mongoose.connect(ATLAS_URI);
console.log("Connected to Atlas:", mongoose.connection.db.databaseName);

const db = mongoose.connection.db;
const users = db.collection("users");

// Check existing
const existing = await users.find({}, { projection: { email: 1, role: 1 } }).toArray();
console.log("Existing users:", existing.length, existing.map(u => u.email + " [" + u.role + "]"));

// Seed admin
const adminExists = await users.findOne({ email: "admin@bakehub.com" });
if (!adminExists) {
  const hash = await bcrypt.hash("admin123", 10);
  await users.insertOne({ name: "BakeHub Admin", email: "admin@bakehub.com", password: hash, phone: "9000000000", role: "admin", createdAt: new Date(), updatedAt: new Date() });
  console.log("✅ Admin created: admin@bakehub.com / admin123");
} else {
  // Fix password hash just in case
  const hash = await bcrypt.hash("admin123", 10);
  await users.updateOne({ email: "admin@bakehub.com" }, { $set: { password: hash, role: "admin" } });
  console.log("✅ Admin password reset: admin@bakehub.com / admin123");
}

const final = await users.find({}, { projection: { email: 1, role: 1, _id: 0 } }).toArray();
console.log("Final users in Atlas:", final);

await mongoose.disconnect();
console.log("Done.");
