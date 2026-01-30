import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectdb } from "./config/db.js";
import mongoose from "mongoose";

import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", userRoutes);

connectdb();

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});
