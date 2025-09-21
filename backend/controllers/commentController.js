const Comment = require('../models/comment')
const Post = require('../models/post')

const getComments = async (req, res) => {
    
    const blogId = req.params.postId

    const data = await Comment.find(blog._id === blogId)
    .populate()
    .exec()

    res.send(data)
}

const addComment = async (req, res) => {

    const blogId = req.params.postId
    const userId = req.user._id
    const { comment } = req.body
    console.log(req.body)
    const addedComment = await Comment.create(
        {
            blog: blogId,
            user: userId,
            comment: comment
        }
    )

    const addCommentToPost = await Post.findByIdAndUpdate(
        blogId,
        { $push: { comments: addedComment._id } },
        { new: true }
    )

    const populatedComment = await Comment.findById(addedComment._id)
      .populate("user", "name picture _id") // only send the fields you need

    res.status(201).json(populatedComment)
}

const updateComment = async (req, res) => {

    
}

const deleteComment = async (req, res) => {


}

module.exports = {getComments, addComment, updateComment, deleteComment}