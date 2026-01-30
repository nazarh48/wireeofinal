import { User } from "../models/User.js";

export async function getCount(req, res, next) {
  try {
    const count = await User.countDocuments();
    return res.status(200).json({ success: true, count });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
}
