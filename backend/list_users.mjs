import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const URI = process.env.MONGO_URI || "mongodb+srv://poojaryykrithika_db_user:gRO2pcZDAQSCs6HQ@bakehub.dx6qwwu.mongodb.net/bakehub?retryWrites=true&w=majority&appName=BakeHub";
await mongoose.connect(URI);
const users = mongoose.connection.db.collection("users");
const all = await users.find({}, { projection: { email: 1, role: 1, _id: 0 } }).toArray();
console.log("Users in DB:", JSON.stringify(all, null, 2));
await mongoose.disconnect();
