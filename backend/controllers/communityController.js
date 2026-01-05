import community from "../models/community.js";
import post from "../models/post.js";
import user from "../models/user.js";

const getAllCommunity = async(req, res) => {
    try
    {   
        const currentUser = req.user
        const topic = req.query.topic // Optional topic filter
        
        const query = topic ? { topics: topic } : {}
        const data = await community.find(query).populate("creator").populate("members").sort({ createdAt: -1 }).exec()
        res.send(data)
    } 
    catch(e){
        console.log(e)
        res.status(500).json({ error: "Failed to fetch communities" })
    }     
}

const joinCommunity = async(req, res) => {
    try
    {
        const currentUser = req.user
        const communityId = req.params.communityId
        const data = await community.findByIdAndUpdate(communityId, { $push: { members: currentUser } }, { new: true }).exec()
        await user.findByIdAndUpdate(currentUser, { $addToSet: { communities: data } }, { new: true }).exec()
        res.send(data)
    }
    catch(e){
        console.log(e)
        res.status(500).json({ error: "Failed to join community" })
    }
}

const leaveCommunity = async(req, res) => {
    try
    {
        const currentUser = req.user
        const communityId = req.params.communityId
        const data = await community.findByIdAndUpdate(communityId, { $pull: { members: currentUser } }, { new: true }).exec()
        await user.findByIdAndUpdate(currentUser, { $pull: { communities: data } }, { new: true }).exec()
        res.json({ message: "Left community successfully", data })
    }
    catch(e){
        console.log(e)
        res.status(500).json({ error: "Failed to leave community" })
    }
}

const getCommunity = async(req, res) => {
    try
    {   
        const currentUser = req.user
        const communityId = req.params.communityId
        const data = await community.findById(communityId)
            .populate("creator")
            .populate("members")
            .populate({
                path: "posts",
                populate: {
                    path: "user",
                    select: "name picture _id"
                },
                options: { sort: { releaseDate: -1 } }
            })
            .exec()
        if (!data) {
            return res.status(404).json({ error: "Community not found" })
        }
        res.send(data)
    } 
    catch(e){
        console.log(e)
        res.status(500).json({ error: "Failed to fetch community" })
    }     
}

const getUserCommunities = async(req, res) => {
    try
    {   
        const userId = req.params.userId
        const data = await community.find({ members: userId }).populate("creator").populate("members").sort({ createdAt: -1 }).exec()
        res.send(data)
    } 
    catch(e){
        console.log(e)
        res.status(500).json({ error: "Failed to fetch user communities" })
    }     
}

const createCommunity = async(req, res) => {
    try
    {
        const currentUser = req.user._id
        const {title, description, moderators, rules, picture, members, posts, topics } = req.body
        
        if (!title) {
            return res.status(400).json({ error: "Title is required" })
        }
        
        const data = await community.create({
                title: title,
                description: description,
                creator: currentUser,
                moderators: moderators || [],
                rules: rules || [],
                picture: picture,
                members: members || [],
                posts: posts || [],
                topics: topics || []
        })
        res.status(201).json(data)
    } 
    catch(e){
        console.log(e)
        res.status(500).json({ error: "Failed to create community" })
    }     
}

// const getPost = async(req, res) => {
//     try
//     {
//         const id = req.params.id
//         const data = await Post.findById(id)
//         .populate({
//             path : "comments",
//             populate: {
//                 path: "user",
//                 select: "name picture"
//             }
//         })
//         .exec()
//         res.send(data)
//     } 
//     catch(e){console.log(e)}     
// }

const editCommunity = async(req, res) => {
    try
    {
        const communityId = req.params.communityId
        const { title, description, moderators, rules, picture, members, posts, topics } = req.body
        
        // Check if community exists and user is creator or moderator
        const existingCommunity = await community.findById(communityId)
        if (!existingCommunity) {
            return res.status(404).json({ error: "Community not found" })
        }
        
        const currentUser = req.user._id
        const isCreator = existingCommunity.creator.toString() === currentUser.toString()
        const isModerator = existingCommunity.moderators?.some(mod => mod.toString() === currentUser.toString())
        
        if (!isCreator && !isModerator) {
            return res.status(403).json({ error: "Only creator or moderators can edit community" })
        }
        
        const updateData = {}
        if (title !== undefined) updateData.title = title
        if (description !== undefined) updateData.description = description
        if (moderators !== undefined) updateData.moderators = moderators
        if (rules !== undefined) updateData.rules = rules
        if (picture !== undefined) updateData.picture = picture
        if (members !== undefined) updateData.members = members
        if (posts !== undefined) updateData.posts = posts
        if (topics !== undefined) updateData.topics = topics
        
        const data = await community.findByIdAndUpdate(communityId, updateData, { new: true }).exec()
        res.json(data)
    } 
    catch(e){
        console.log(e)
        res.status(500).json({ error: "Failed to update community" })
    }  
}

const deleteCommunity = async(req, res) => {
    try
    {
        const communityId = req.params.communityId
        
        // Check if community exists and user is creator
        const existingCommunity = await community.findById(communityId)
        if (!existingCommunity) {
            return res.status(404).json({ error: "Community not found" })
        }
        
        const currentUser = req.user._id
        const isCreator = existingCommunity.creator.toString() === currentUser.toString()
        
        if (!isCreator) {
            return res.status(403).json({ error: "Only creator can delete community" })
        }
        
        const data = await community.findByIdAndDelete(communityId).exec()
        res.json({ message: "Community deleted successfully", data })
    } 
    catch(e)
    {
        console.log(e)
        res.status(500).json({ error: "Failed to delete community" })
    }   
}

export { getAllCommunity, getCommunity, getUserCommunities, deleteCommunity, createCommunity, editCommunity, joinCommunity, leaveCommunity}