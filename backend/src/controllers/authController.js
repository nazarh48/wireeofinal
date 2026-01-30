import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { config } from "../config/index.js";

function signToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function toUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    const user = await User.create({ name, email, password });
    const token = signToken(user);
    return res.status(201).json({
      success: true,
      token,
      user: toUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const token = signToken(user);
    return res.status(200).json({
      success: true,
      token,
      user: toUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    const token = signToken(user);
    return res.status(200).json({
      success: true,
      token,
      user: toUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}
