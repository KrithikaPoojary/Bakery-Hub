import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ATLAS_URI = "mongodb+srv://poojaryykrithika_db_user:gRO2pcZDAQSCs6HQ@bakehub.dx6qwwu.mongodb.net/bakehub?retryWrites=true&w=majority&appName=BakeHub";

await mongoose.connect(ATLAS_URI);
console.log("Connected to Atlas MongoDB");

const db = mongoose.connection.db;

// 1. Create a sample verified Owner
const ownerEmail = "owner@bakehub.com";
let owner = await db.collection("users").findOne({ email: ownerEmail });
if (!owner) {
  const hash = await bcrypt.hash("owner123", 10);
  const result = await db.collection("users").insertOne({
    name: "Master Baker Sunil",
    email: ownerEmail,
    password: hash,
    phone: "9876543210",
    role: "owner",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  owner = { _id: result.insertedId, name: "Master Baker Sunil", email: ownerEmail };
  console.log("✅ Created Owner: owner@bakehub.com / owner123");
} else {
  console.log("Owner exists:", owner.email);
}

// 2. Create an Approved Bakery
let bakery = await db.collection("bakeries").findOne({ ownerId: owner._id });
if (!bakery) {
  const bResult = await db.collection("bakeries").insertOne({
    name: "Sweet Delights Artisan Bakery",
    description: "Freshly baked artisan sourdough, delicious cakes, pastries & handcrafted cookies baked daily with love.",
    address: "123 MG Road, Indiranagar, Bangalore",
    phone: "9876543210",
    ownerId: owner._id,
    status: "approved",
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  bakery = { _id: bResult.insertedId, name: "Sweet Delights Artisan Bakery" };
  console.log("✅ Created Approved Bakery:", bakery.name);
} else {
  await db.collection("bakeries").updateOne({ _id: bakery._id }, { $set: { status: "approved" } });
  console.log("Bakery exists and approved:", bakery.name);
}

// 3. Add Sample Menu Items
const existingMenu = await db.collection("menus").find({ bakeryId: bakery._id }).toArray();
if (existingMenu.length === 0) {
  const sampleItems = [
    {
      name: "Belgian Chocolate Truffle Cake",
      description: "Rich dark chocolate ganache layered with moist sponge.",
      price: 650,
      category: "Cakes",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
      bakeryId: bakery._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Butter Croissant (Pack of 2)",
      description: "Flaky, golden-brown French butter croissants.",
      price: 180,
      category: "Pastries",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
      bakeryId: bakery._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Artisan Sourdough Loaf",
      description: "Naturally fermented classic sourdough with a crispy crust.",
      price: 220,
      category: "Breads",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&q=80",
      bakeryId: bakery._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Red Velvet Cupcakes (4 pcs)",
      description: "Soft red velvet sponge topped with cream cheese frosting.",
      price: 320,
      category: "Cupcakes",
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&q=80",
      bakeryId: bakery._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await db.collection("menus").insertMany(sampleItems);
  console.log("✅ Seeded", sampleItems.length, "delicious menu items!");
}

await mongoose.disconnect();
console.log("Seeding complete! Atlas MongoDB is fully primed.");
