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
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "serviceProvider", "customer"],
      default: "customer",
    },
  },
  {
    timestamps: true,
    autoIndex: true,
  },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
