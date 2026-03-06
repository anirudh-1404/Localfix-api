import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectdb } from "./config/db.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";


import userRoutes from "./routes/userRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import cartRoutes from "./routes/cartRoutes.js"

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/cart", cartRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running", status: "ok" });
});


const startServer = async () => {
  try {
    await connectdb();

    app.listen(process.env.PORT, () => {
      console.log(`App listening on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Server failed to start:", err.message);
    process.exit(1);
  }
};

startServer();
