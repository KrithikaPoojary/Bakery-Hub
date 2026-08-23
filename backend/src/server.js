import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";

// 🔥 Import all routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import bakeryRoutes from "./routes/bakery.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import payoutRoutes from "./routes/payout.routes.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Allow frontend to connect
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://bakeryhub-app.vercel.app",
  /\.vercel\.app$/,
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = allowedOrigins.some((o) =>
        typeof o === "string" ? o === origin : o.test(origin)
      );
      cb(allowed ? null : new Error("CORS: origin not allowed"), allowed);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// 🌐 Simple homepage
app.get("/", (_req, res) => {
  res.send(`
    <html>
      <head><title>BakeHub</title></head>
      <body style="font-family:Arial;max-width:720px;margin:40px auto;">
        <h1>🍰 BakeHub API</h1>
        <p>Your neighborhood bakery marketplace.</p>
        <ul>
          <li>Customer: browse nearby bakeries</li>
          <li>Bakery Owner: manage menu & orders</li>
          <li>Admin: approve bakeries</li>
        </ul>
        <p>API health: <a href="/api/health">/api/health</a></p>
      </body>
    </html>
  `);
});

// ❤️ Health route
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "BakeHub API", mongo: !!process.env.MONGO_URI, jwt: !!process.env.JWT_SECRET })
);

// 🔍 Temp debug: list users in deployed DB (REMOVE AFTER DIAGNOSIS)
app.get("/api/debug-users", async (_req, res) => {
  try {
    await connectDB();
    const mongoose = (await import("mongoose")).default;
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collNames = collections.map(c => c.name);
    const users = await db.collection("users").find({}, { projection: { email: 1, role: 1, _id: 0 } }).toArray();
    const uri = process.env.MONGO_URI || "NOT SET";
    res.json({
      dbName: db.databaseName,
      collections: collNames,
      userCount: users.length,
      users,
      uriSnippet: uri.substring(0, 80)
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// File path utilities
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static folder for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "./public/uploads")));

// Ensure database connection middleware for serverless
app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

// Register all routes
app.use("/uploads", express.static("public/uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/bakeries", bakeryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payouts", payoutRoutes);

// 🚀 Start server locally if not running on Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
}

export default app;
