import Post from "../models/post.js";
import community from "../models/community.js";
import List from "../models/list.js";
import Comment from "../models/comment.js";

const fetchPosts = async(req, res) => {
    try
    {   
        const currentUser = req.user
        const data = await Post.find().populate("user").sort({ releaseDate: -1 }).exec()
        res.send(data)
    } 
    catch(e){console.log(e)}     
}

const fetchUserPosts = async(req, res) => {
    try
    {   
        const userId = req.params.id
        const data = await Post.find({ user: userId}).exec()
        res.send(data)
    } 
    catch(e){console.log(e)}     
}

const createPost = async(req, res) => {
    try
    {
        const currentUser = req.user._id
        const {title, summary, content, categories, communityId } = req.body
        
        // Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({ error: "Title is required" });
        }
        
        if (!communityId) {
            return res.status(400).json({ error: "Community selection is required" });
        }
        
        // Verify community exists
        const communityExists = await community.findById(communityId);
        if (!communityExists) {
            return res.status(404).json({ error: "Community not found" });
        }
        
        // Create the post - summary defaults to empty string
        const postData = {
            title : title.trim(),
            summary : (summary && summary.trim()) ? summary.trim() : '',
            content : content,
            releaseDate : Date.now(),
            user : currentUser,
            categories: categories || []
        }
        
        const data = await Post.create(postData)
        
        // Add the post to the community's posts array
        await community.findByIdAndUpdate(
            communityId,
            { $push: { posts: data._id } },
            { new: true }
        ).exec();
        
        res.status(201).json(data)
    } 
    catch(e){
        console.log(e)
        res.status(500).json({ error: "Failed to create post", details: e.message })
    }     
}

const getPost = async(req, res) => {
    try
    {
        const id = req.params.id
        const data = await Post.findById(id)
        .populate({
            path : "comments",
            populate: {
                path: "user",
                select: "name picture"
            }
        })
        .exec()
        
        // Find which community this post belongs to
        if (data) {
            const communityData = await community.findOne({ posts: id }).select('_id title').exec();
            if (communityData) {
                // Add community info to the response
                const responseData = data.toObject();
                responseData.community = {
                    _id: communityData._id,
                    title: communityData.title
                };
                return res.send(responseData);
            }
        }
        
        res.send(data)
    } 
    catch(e){
        console.log(e);
        res.status(500).json({ error: "Failed to fetch post" });
    }     
}

const updatePost = async(req, res) => {
    try
    {
        const postId = req.params.id
        const currentUser = req.user._id
        const {title, summary, content, communityId} = req.body
        
        // Find the post first to check ownership
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        
        // Check if user is the owner
        if (post.user.toString() !== currentUser.toString()) {
            return res.status(403).json({ error: "You can only edit your own posts" });
        }
        
        // Validate required fields
        if (!title || !title.trim()) {
            return res.status(400).json({ error: "Title is required" });
        }
        
        if (!communityId) {
            return res.status(400).json({ error: "Community selection is required" });
        }
        
        // Verify community exists
        const communityExists = await community.findById(communityId);
        if (!communityExists) {
            return res.status(404).json({ error: "Community not found" });
        }
        
        // Update the post
        const updateData = {
            title: title.trim(),
            summary: (summary && summary.trim()) ? summary.trim() : '',
            content: content
        };
        
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            updateData,
            { new: true }
        ).exec();
        
        // Handle community change - remove from old community, add to new one
        const oldCommunityId = await community.findOne({ posts: postId }).select('_id').exec();
        
        if (oldCommunityId && oldCommunityId._id.toString() !== communityId) {
            // Remove from old community
            await community.findByIdAndUpdate(
                oldCommunityId._id,
                { $pull: { posts: postId } }
            ).exec();
        }
        
        // Add to new community if not already there
        const isInNewCommunity = await community.findOne({
            _id: communityId,
            posts: postId
        }).exec();
        
        if (!isInNewCommunity) {
            await community.findByIdAndUpdate(
                communityId,
                { $addToSet: { posts: postId } }
            ).exec();
        }
        
        res.status(200).json(updatedPost);
    } 
    catch(e){
        console.log(e);
        res.status(500).json({ error: "Failed to update post", details: e.message });
    }  
}

const deletePost = async(req, res) => {
    try
    {
        const postId = req.params.id
        const currentUser = req.user._id
        
        // Find the post first to check ownership
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        
        // Check if user is the owner
        if (post.user.toString() !== currentUser.toString()) {
            return res.status(403).json({ error: "You can only delete your own posts" });
        }
        
        // Remove post from community's posts array if it exists in a community
        await community.updateMany(
            { posts: postId },
            { $pull: { posts: postId } }
        );
        
        // Remove post from all lists that contain it
        await List.updateMany(
            { blogs: postId },
            { $pull: { blogs: postId } }
        );
        
        // Delete all comments associated with this post
        await Comment.deleteMany({ blog: postId }).exec();
        
        // Delete the post
        await Post.findByIdAndDelete(postId).exec();
        
        res.status(200).json({ message: "Post deleted successfully" });
    } 
    catch(e){
        console.log(e);
        res.status(500).json({ error: "Failed to delete post" });
    }   
}

export { fetchPosts, fetchUserPosts, getPost, updatePost, createPost, deletePost };