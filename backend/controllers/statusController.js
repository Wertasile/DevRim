const client = require("../config/redis")
const User = require("../models/user")

const getUserStatus = async (req,res) => {
    try {
        const userId = req.user._id

        const isOnline = await client.hExists("online_users", userId)

        if (isOnline) return res.json({status: "online"})
        
        const user = await User.findById(userId).select("lastSeen status")
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json({
            status: user.status,
            lastSeen: user.lastSeen
        })
    } catch (error) {
        return res.status(500).json({success:false, message:"Server failed successfully"})
    }
}


module.exports = { getUserStatus }