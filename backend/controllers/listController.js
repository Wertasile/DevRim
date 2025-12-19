import List from '../models/list.js';
import Post from '../models/post.js';
import User from '../models/user.js';

const getAllList = async (req, res) => {
    
    const userId = req.params.userId

    const data = await List.find({user: userId}).populate("blogs")
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
    console.log(listId)
    console.log(blogId)


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

const updateList = async (req, res) => {
    try {
        const listId = req.params.listId
        const userId = req.user._id
        const { name } = req.body

        // Find the list first to check ownership
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ error: "List not found" });
        }

        // Check if user is the owner
        if (list.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only edit your own lists" });
        }

        // Validate name
        if (!name || !name.trim()) {
            return res.status(400).json({ error: "List name is required" });
        }

        // Update the list
        const updatedList = await List.findByIdAndUpdate(
            listId,
            { name: name.trim() },
            { new: true }
        ).populate("blogs").exec();

        res.status(200).json(updatedList);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to update list", details: e.message });
    }
}

const deleteList = async (req, res) => {
    try {
        const listId = req.params.listId
        const userId = req.user._id

        // Find the list first to check ownership
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ error: "List not found" });
        }

        // Check if user is the owner
        if (list.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only delete your own lists" });
        }

        // delete the list itself
        const data = await List.findByIdAndDelete(listId)

        // also remove reference from user.lists
        await User.findByIdAndUpdate(
          userId,
          { $pull: { lists: listId } }
        )

        res.status(200).json(data)
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "Failed to delete list", details: e.message });
    }
}

export { getAllList, fetchList, createList, addToList, deleteFromList, updateList, deleteList };