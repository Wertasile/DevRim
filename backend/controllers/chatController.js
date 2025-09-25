const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Chat = require("../models/chat");
const User = require("../models/user");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);   // if chat already exists
  } else {
    var chatData = {        
      chatName: "sender",   // if chat does not exist it is created here
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    console.log("FETCH USER")
    console.log(req.user._id)
    const userId = req.user._id;

    const chats = await Chat.find({ users: userId })
    .populate("users")
      // .populate("users", "-password")
      // .populate("groupAdmin", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name given_name pic email",
        },
      })
      .populate({
        path: "pinned",
        populate: {
          path: "sender",
          select: "name given_name pic email",
        },
      })
      .sort({ updatedAt: -1 })
      res.status(200).json(chats);
    
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Delete Chat
//@route           DELETE /api/chat/
//@access          Protected
const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  if (!chatId) {
    return res.status(400).json({ message: "chatId is required" });
  }
  const deletedChat = await Chat.findByIdAndDelete(chatId);
  if (!deletedChat) {
    return res.status(404).json({ message: "Chat not found" });
  }
  res.status(200).json(deletedChat);
});



//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = req.body.users;

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    // response to the console

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId
  const { chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /chats/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});



// @desc    Modify the users in a group
// @route   PUT /chats/groupedit
// @access  Protected
const editGroupUsers = async (req, res) => {
  
  try {
    const userId = req.user.userId
    const chatId = req.params.chatId
    const { users } = req.body.users

    const chatData = await Chat.findById(chatId)
    chatData.users = users

    const modifiedChat = await chatData.save()

    modifiedChat.populate("users")

    res.status(200).json(modifiedChat)
  } catch (error) {
    res.status(500).json({message: "Server Error"})
  }
}

const pinMessage = async (req, res) => {
  try {
    const chatId = req.params.chatId
    const messageId = req.body.messageId
    
    const pinMessage = await Chat.findByIdAndUpdate(
      chatId,
      {
      $push: { pinned: messageId },
      },
      {
        new: true,
      }
    )

    res.status(200).json(pinMessage)
    
  } catch (error) {
    res.status(500).json({message: "Server Error"})
  }
}

const unpinMessage = async (req, res) => {
  try {
    const chatId = req.params.chatId
    const messageId = req.body.messageId
    
    const unpinMessage = await Chat.findByIdAndUpdate(
      chatId,
      {
      $pull: { pinned: messageId },
      },
      {
        new: true,
      }
    )

    res.status(200).json(unpinMessage)
    
  } catch (error) {
    res.status(500).json({message: "Server Error"})
  }
}

module.exports = {
  accessChat,
  fetchChats,
  deleteChat,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  editGroupUsers,
  pinMessage,
  unpinMessage
};