import User from "../models/userModel.js";
import imagekit from "../config/imagekit.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import sendMail from "../utils/sendEmail.js";

dotenv.config();

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signup = async (req, res) => {
  try {
    // Get the data from the frontend

    const { name, email, password, avatar } = req.body;
    // check the data is correct or not?
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name,emailID and password are required" });
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({ message: "EmailId already exists" });
    }

    let avatarUrl = "";
    if (avatar) {
      const uploadResponse = await imagekit.upload({
        file: avatar,
        fileName: `avatar_${Date.now()}.jpg`,
        folder: "/mern-music-player",
      });

      avatarUrl = uploadResponse.url;
    }

    const user = await User.create({
      name,
      email,
      password,
      avatar: avatarUrl,
    });

    const token = createToken(user._id);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  } catch (errror) {
    console.error("Signup not sucessfull");
    res.status(500).json({ message: "Signup Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "EmailId doesn't exists" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login not successfull", error.message);
    res.status(500).json({ message: "Login Error" });
  }
};

// Protected Controller
const getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not Authenticated" });
  res.status(200).json(req.user);
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user Found" });

    // Generated a token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send an email
    await sendMail({
      to: user.email,
      subject: "Reset your password",
      html: `
  <h3>Password Reset</h3>
  <p> Click on the link below to reset your password</p>
  <a  href="${resetUrl}">${resetUrl}</a>
  <p>This link expires in 10 minutes</p>`,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot Password error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "PAssword must be atleast 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token is invalid or expired" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password error:", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { name, email, avatar, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (name) user.name = name;

    if (email) user.email = email;

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Both current and new password are required" });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be atleast 6 characters" });
      }
      user.password = newPassword;
    }

    if (avatar) {
      const uploadResponse = await imagekit.upload({
        file: avatar,
        fileName: `avatar_${userId}_${Date.now()}.jpg`,
        folder: "/mern-music-player",
      });

      user.avatar = uploadResponse.url;
    }
    await user.save();

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },

      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Edit Profile Error", error.message);
    res.status(500).json({ message: "Error in updating profile" });
  }
};

export { signup, login, getMe, forgotPassword, resetPassword, editProfile };
