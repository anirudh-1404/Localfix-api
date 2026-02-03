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
        id: isUserExists._id,
        data: { email: email },
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
export const logoutUser = async(req,res)=>{
  try{
    res.cookie("token", "",{
      httpOnly: true,
      secure: process.enev.NODE_ENV ==='production',
      sameSite:" strict",
      expires: new Date(0),
    });
  }catch(err){
    return res.status(500).json({
      message:err.message,
    });
  }
};
