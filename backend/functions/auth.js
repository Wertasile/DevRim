import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate({
      path: "liked",
      populate : {
        path: "comments"
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // 👈 Now req.user is accessible in getPersonalData
    next(); // ✅ This moves to the next middleware/handler
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authenticateUser;
