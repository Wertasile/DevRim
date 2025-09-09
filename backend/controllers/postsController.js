const Post = require("../models/post");

const fetchPosts = async(req, res) => {
    try
    {   
        const currentUser = req.user
        const data = await Post.find().populate("user").exec()
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
        const {title, summary, content, categories } = req.body
        const data = await Post.create({
            title : title,
            summary : summary,
            content : content,
            releaseDate : Date.now(),
            user : currentUser,
            categories: categories
        })
        res.status(201).json(data)
    } 
    catch(e){console.log(e)}     
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
        res.send(data)
    } 
    catch(e){console.log(e)}     
}

const updatePost = async(req, res) => {
    try
    {
        const id = req.params._id
        const data = await Post.findByIdAndUpdate(id).exec()
    } 
    catch(e){console.log(e)}  
}

const deletePost = async(req, res) => {
    try
    {
        const id = req.params._id
        const data = await Post.findByIdAndDelete({_id : id}).exec()
    } 
    catch(e){console.log(e)}   
}

module.exports = {fetchPosts, fetchUserPosts, getPost, updatePost, createPost, deletePost}