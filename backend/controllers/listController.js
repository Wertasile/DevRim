const List = require('../models/list')
const Post = require('../models/post')
const User = require('../models/user')

const getAllList = async (req, res) => {
    
    const userId = req.params.userId

    const data = await List.find({user: userId})
    .exec()

    res.send(data)
}

const fetchList = async (req, res) => {
    
    const listId = req.params.listId

    const data = await List.findById(listId)
    .populate("blogs")
    .exec()

    res.send(data)
}

const createList = async (req, res) => {

    const userId = req.user._id
    const { name } = req.body
    console.log(req.body)
    const addedList = await List.create(
        {
            blogs: [],
            user: userId,
            name: name
        }
    )

    const addListToUser = await User.findByIdAndUpdate(
        userId,
        { $push: { lists: addedList._id } },
        { new: true }
    )

    res.status(201).json(addedList)
}

const addToList = async (req, res) => {

    const listId = req.params.listId
    const blogId = req.params.blogId

    const userId = req.user._id
    
    console.log(req.body)

    const addBlogToList = await List.findByIdAndUpdate(
        listId,
        { $addToSet: { blogs: blogId } },
        { new: true }
    )
    
    res.status(201).json(addBlogToList)
    
}

const deleteFromList = async (req, res) => {

    const listId = req.params.listId
    const blogId = req.params.blogId

    const userId = req.user._id

    console.log(req.body)

    const addBlogToList = await List.findByIdAndUpdate(
        listId,
        { $pull: { blogs: blogId } },
        { new: true }
    )
    
    res.status(201).json(addBlogToList)
    
}

const deleteList = async (req, res) => {

    const listId = req.params.listId
    const userId = req.user._id

    // delete the list itself
    const data = await List.findByIdAndDelete(listId)

    // also remove reference from user.lists
    await User.findByIdAndUpdate(
      userId,
      { $pull: { lists: listId } }
    )

    res.status(200).json(data)
}

module.exports = {getAllList, fetchList, createList, addToList, deleteFromList, deleteList}