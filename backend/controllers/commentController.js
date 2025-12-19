import Comment from '../models/comment.js';
import Post from '../models/post.js';

const getComments = async (req, res) => {
    
    const blogId = req.params.postId

    const data = await Comment.find({ blog: blogId })
    .populate("user", "name picture _id")
    .populate({
        path: "replyTo",
        populate: { path: "user", select: "name picture _id" }
    })
    .exec()

    res.send(data)
}

const addComment = async (req, res) => {

    const blogId = req.params.postId
    const userId = req.user._id
    const { comment, replyTo } = req.body
    console.log(req.body)
    
    const commentData = {
        blog: blogId,
        user: userId,
        comment: comment
    }
    
    if (replyTo) {
        commentData.replyTo = replyTo
    }
    
    const addedComment = await Comment.create(commentData)

    const addCommentToPost = await Post.findByIdAndUpdate(
        blogId,
        { $push: { comments: addedComment._id } },
        { new: true }
    )

    const populatedComment = await Comment.findById(addedComment._id)
      .populate("user", "name picture _id")
      .populate({
          path: "replyTo",
          populate: { path: "user", select: "name picture _id" }
      })

    res.status(201).json(populatedComment)
}

const updateComment = async (req, res) => {

    
}

const deleteComment = async (req, res) => {


}

export { getComments, addComment, updateComment, deleteComment };