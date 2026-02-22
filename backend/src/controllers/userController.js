import bcrypt from "bcryptjs";
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

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role, status, emailVerified, twoFactorEnabled } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // hashed by pre-save hook
      role: role || "user",
      status: status || "active",
      emailVerified: emailVerified === true || emailVerified === "true",
      twoFactorEnabled: twoFactorEnabled === true || twoFactorEnabled === "true",
    });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ success: true, user: userObj });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, password, role, status, emailVerified, twoFactorEnabled } = req.body;

    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check email uniqueness if changing
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: id } });
      if (emailTaken) {
        return res.status(409).json({ success: false, message: "Email already in use by another account." });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name !== undefined) user.name = name.trim();
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (emailVerified !== undefined) user.emailVerified = emailVerified === true || emailVerified === "true";
    if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled === true || twoFactorEnabled === "true";

    // Only update password if a new one is provided
    if (password && password.trim() !== "") {
      user.password = password; // hashed by pre-save hook
    }

    await user.save({ validateBeforeSave: false });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ success: true, user: userObj });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (req.user && req.user.userId === id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    next(err);
  }
}
