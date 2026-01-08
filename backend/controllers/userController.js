import User from "../models/user.js";
import Post from '../models/post.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const saltRounds = 10;
dotenv.config();

const fetchUser = async (req, res) => {
    try {
        const id = req.params.userid
        const data = await User.findOne({_id:id})
            .populate({
                path : "liked",
                populate: {
                    path: "user",
                    select: "name picture"
                }
            })
        res.send(data)
    } catch (error) {
        console.log(error)
    }
}

const signUp = async (req, res) => {
    try {
        console.log("Sign up request received:", { email: req.body.email, name: req.body.name });
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            console.log("Validation failed: missing fields");
            return res.status(400).json({ 
                error: "Email, password, and name are required",
                details: { email: !!email, password: !!password, name: !!name }
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User already exists with email:", email);
            return res.status(409).json({ error: "User with this email already exists" });
        }

        // Validate password length
        if (password.length < 8) {
            console.log("Password too short");
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        // Hash password
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log("Password hashed successfully");

        // Create user
        console.log("Creating user...");
        const newUser = await User.create({
            email,
            password: hashedPassword,
            name,
            emailVerified: false,
            liked: [],
            lists: [],
            following: [],
            followers: [],
            connections: [],
            requestsSent: [],
            requestsReceived: [],
            communities: [],
            status: "offline"
        });
        console.log("User created successfully:", newUser._id);

        // Check if JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not set in environment variables!");
            return res.status(500).json({ error: "Server configuration error" });
        }

        // Create JWT token (same as Google login)
        const jwtToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        const isProduction = process.env.NODE_ENV === "production";

        // Set cookie
        res.cookie("token", jwtToken, {
            secure: isProduction,
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Return user data (without password)
        const userData = {
            _id: newUser._id,
            email: newUser.email,
            name: newUser.name,
            emailVerified: newUser.emailVerified,
            picture: newUser.picture || "",
            byline: newUser.byline || "",
            about: newUser.about || "",
        };

        console.log("Sign up successful, returning user data");
        res.status(201).json({ success: true, user: userData });
    } catch (error) {
        console.error("Sign up error:", error);
        console.error("Error stack:", error.stack);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        if (error.code === 11000) { // MongoDB duplicate key error
            return res.status(409).json({ error: "User with this email already exists" });
        }
        
        res.status(500).json({ 
            error: "Failed to create user account",
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

const createUser = signUp; // Keep for backward compatibility

const loginUser = async (req, res) => {
    try {
        console.log("Login request received:", { email: req.body.email });
        const { email, password } = req.body;

        if (!email || !password) {
            console.log("Validation failed: missing email or password");
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find user by email
        console.log("Searching for user with email:", email);
        const user = await User.findOne({ email }).exec();

        if (!user) {
            console.log("User not found with email:", email);
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check if user has a password (Google users might not have one)
        if (!user.password) {
            console.log("User found but has no password (likely Google user):", email);
            return res.status(401).json({ 
                error: "This email is registered with Google. Please use Google Sign In." 
            });
        }

        // Verify password
        console.log("Verifying password...");
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            console.log("Password verification failed for email:", email);
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Check if JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not set in environment variables!");
            return res.status(500).json({ error: "Server configuration error" });
        }

        // Create JWT token (same as Google login)
        const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        const isProduction = process.env.NODE_ENV === "production";

        // Set cookie (same as Google login)
        res.cookie("token", jwtToken, {
            secure: isProduction,
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Return user data (without password)
        const userData = {
            _id: user._id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            picture: user.picture || "",
            byline: user.byline || "",
            about: user.about || "",
        };

        console.log("Login successful for user:", user._id);
        res.json({ success: true, user: userData });
    } catch (error) {
        console.error("Login error:", error);
        console.error("Error stack:", error.stack);
        console.error("Error message:", error.message);
        res.status(500).json({ 
            error: "Failed to login",
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

const logoutUser = async (req, res) => {
    res.clearCookie('refreshToken', { httpOnly: true, secure:false,sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000})
    return res.json({ message: 'Logged out' });

}

const deleteUser = async (req, res) => {
    try {
        const id = req.params._id
        const data = await User.findByIdAndDelete(id).exec()
        res.send(data)
    } catch (error) {
        console.log(error)
    }
}

const likeBlog = async (req, res) => {

    const userId = req.user._id
    const blogId = req.params.blogId

    const updateLike = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { liked: blogId } },
        { new: true } 
    )

    const addToBlogLikes = await Post.findByIdAndUpdate(
        blogId,
        { $addToSet: { likes: userId } }
    )

    res.send(updateLike)
}

const unlikeBlog = async (req, res) => {

    const userId = req.user._id
    const blogId = req.params.blogId

    const updateLike = await User.findByIdAndUpdate(
        userId,
        { $pull: { liked: blogId } }
    )

    const removeFromBlogLikes = await Post.findByIdAndUpdate(
        blogId,
        { $pull: { likes: userId } }
    )

    res.send(updateLike)

}

const allUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [{ name: { $regex: req.query.search, $options: "i" } }],
        }
      : {};

    const users = await User.find(keyword).select("-password"); // hide sensitive data
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const follow = async (req, res) => {

    try {
        const userId = req.user._id
        const followId = req.params.userId
        console.log("current user" + userId)
        console.log("follow id user" + followId)

        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { following: followId } },
            { new: true }
        )

        await User.findByIdAndUpdate(
            followId,
            { $addToSet: { followers: userId } },
            { new: true }
        )
        res.json({ success: true, message: "Followed successfully" })
    } catch (error) {
        res.status(500).json({success: false, message: "message: server error"})
    }


}

const unfollow = async (req, res) => {
    
    try{
        const userId = req.user._id
        const followId = req.params.userId

        await User.findByIdAndUpdate(
            userId,
            { $pull: { following: followId } },
            { new: true }
        )

        await User.findByIdAndUpdate(
            followId,
            { $pull: { followers: userId } },
            { new: true }
        )

        res.json({success: true, message: "unfollowed Successfully"})
    }
    catch( error ){
        res.status(500).json({ success: false, message: "Server error" })
    }
}

const connect = async (req, res) => {
    try {
        const userId = req.user._id
        const otherUserId = req.params.userId

        await User.findByIdAndUpdate(userId,
            { $addToSet: { requestsSent: otherUserId} },
            { new: true }
        )
        
        await User.findByIdAndUpdate(otherUserId,
            { $addToSet: { requestsReceived: userId} },
            { new: true }
        )

        res.json({ success: true, message: 'Request send successfully' })

    } catch (error) {
        res.status(500).json({success: false, message: "Failed to send connection request"})
    }
}

const disconnect = async (req, res) => {
    try {
        const userId = req.user._id
        const otherUserId = req.params.userId

        await User.findByIdAndUpdate(otherUserId,
            { $pull: { connections: userId } },
            { new: true }
        )

        await User.findByIdAndUpdate(userId,
            { $pull: { connections: otherUserId } },
            { new: true }
        )

        res.json({ success: true, message: 'Disconnected successfully' })
        
    } catch (error) {
        res.status(500).json({success: false, message: "Failed to remove connection"})
    }
}

// from other users end
const accept = async (req, res) => {

    const userId = req.user._id
    const otherUserId = req.params.userId    

    try {
        await User.findByIdAndUpdate(userId,
            { $pull: { requestsReceived: otherUserId} },
            { new: true }
        )

        await User.findByIdAndUpdate(otherUserId,
            { $pull: { requestsSent: userId} },
            { new: true }
        )

        await User.findByIdAndUpdate(otherUserId,
            { $addToSet: { connections: userId } },
            { new: true }
        )

        await User.findByIdAndUpdate(userId,
            { $addToSet: { connections: otherUserId } },
            { new: true }
        )
        
        
        
    } catch (error) {
        res.status(500).json({success: false, message: "Failed to send connection request"})
    }
}

const decline = async (req, res) => {

    const userId = req.user._id
    const otherUserId = req.params.userId    

    try {
        await User.findByIdAndUpdate(userId,
            { $pull: { requests: otherUserId} },
            { new: true }
        )
        
        
    } catch (error) {
        res.status(500).json({success: false, message: "Failed to send connection request"})
    }
}

const updateUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, given_name, family_name, picture, byline, about } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (given_name !== undefined) updateData.given_name = given_name;
        if (family_name !== undefined) updateData.family_name = family_name;
        if (picture !== undefined) updateData.picture = picture;
        if (byline !== undefined) updateData.byline = byline;
        if (about !== undefined) updateData.about = about;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ success: false, message: "Failed to update user details" });
    }
}


export { 
    fetchUser,
    createUser,
    signUp,
    loginUser,
    logoutUser,
    deleteUser,
    likeBlog,
    unlikeBlog,
    allUsers,
    follow,
    unfollow,
    connect,
    disconnect,
    accept,
    decline,
    updateUser
};