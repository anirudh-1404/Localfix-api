import { User } from "../models/userSchema.js";
import { genToken } from "../utils/authToken.js";
import { comparePassword, hashedPassword } from "../utils/hashedPass.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    }

    const isUser = await User.findOne({ email });
    if (isUser) {
      return res.status(403).json({
        message: "User already exists!",
      });
    }

    const hashed = await hashedPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    const token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 * 2,
    });

    return res.status(201).json({
      message: "User created successfully",
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
      token
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required!",
      });
    }

    const isUserExists = await User.findOne({ email });
    if (!isUserExists) {
      return res.status(404).json({
        message: "User does not exists!",
      });
    }

    const isPasswordCorrect = await comparePassword(
      password,
      isUserExists.password,
    );

    if (isPasswordCorrect) {
      const token = await genToken(isUserExists._id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 * 2,
      });
      return res.status(200).json({
        message: "Login successfull",
        success: true,
        data: {
          _id: isUserExists._id,
          name: isUserExists.name,
          role: isUserExists.role,
          email: isUserExists.email,
        },
        token
      });
    } else {
      return res.status(403).json({
        message: "Invalid credentials",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const assignAdminRole = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: `User ${email} promoted to admin successfully`,
      success: true,
      data: user,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// ✅ GET /api/auth/me — returns current logged-in user from cookie
export const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ POST /api/auth/logout — clears the auth cookie
export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};