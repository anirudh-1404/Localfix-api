import { User } from "../models/userSchema.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
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

    const user = await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "User created successfully",
      id: user._id,
      data: { user },
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

    return res.status(200).json({
      message: "Login successfull",
      id: isUserExists._id,
      data: { isUserExists },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
