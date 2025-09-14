const User = require("../models/user")
const Post = require('../models/post')

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const saltRounds = 10;
require('dotenv').config()

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

const createUser = async (req, res) => {
    try {
        const { email, password, username } = req.body
        bcrypt.hash(password, saltRounds, async function(err, hash) {
            const data = await User.create({
            email: email,
            username: username,
            timestamp: Date.now(),
            password: hash,
            status: "",
            bio: "",
            posts : []
            })

            res.redirect("http://localhost:5500/frontend/Pages/Home");
        });
        
        
    } catch (error) {
        console.log(error)
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body
        const data = await User.findOne({email: email}).exec()
        
        if (!data){
            return res.status(401).send("User cannot be found. Produce new email")
        }
        const hashed_pass = data.password
        // bcrypt.compare(password, hash, function(err, result) {
        //     if (result===true){
        //         res.redirect("http://localhost:5500/frontend/Pages/Home");
        //     } else{
        //         res.status(404).send('Sorry, we cannot find that!')
        //     }
        // });
        const valid = await bcrypt.compare(password, hashed_pass);

        if (!valid){
            return res.status(401).send('Invalid Username or Password');
        }

        const accessToken = jwt.sign({ id: data._id }, process.env.SECRET_KEY, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: data._id }, process.env.SECRET_KEY, { expiresIn: '7d'});

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure:false,sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000})

        res.json({accessToken, id:data._id})
        
    } catch (error) {
        console.log(error)
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

        await User.findByIdAndUpdate(otherUserId,
            { $addToSet: { requests: userId} },
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

        res.json({ success: true, message: 'Request send successfully' })
        
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
            { $pull: { requests: otherUserId} },
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

const fetchRequests = async (req, res) => {
    
}


module.exports = { fetchUser, createUser, loginUser, logoutUser, deleteUser, likeBlog, unlikeBlog, allUsers, follow, unfollow,
                   connect, disconnect, accept, decline, fetchRequests }