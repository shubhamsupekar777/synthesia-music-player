import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not Authorized, missing Token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Not Authorized" });
    req.user = user;
    next();
  } catch (error) {
    console.error("Token Verification Failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
