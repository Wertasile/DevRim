import asyncHandler from "express-async-handler";
import Message from "../models/message.js";
import User from "../models/user.js";
import Chat from "../models/chat.js";

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    // JSON response being sent back to console.
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name picture email")
      .populate({
        path: "reply",
        populate: { path: "sender", select: "name picture email" },
      })
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  console.log("request body" + req.body)
  const { content, chatId, messageType, url, reply } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    messageType : messageType,
    url : url,
    chat: chatId,
  };

  if (reply){
    newMessage.reply = reply
  }

  try {
    var created = await Message.create(newMessage);

    console.log("Message stored in MongoDB:", created); // Log MongoDB insert result


    //JSON response being sent back to console.
  const message = await Message.findById(created._id)
    .populate("sender", "name picture")
    .populate({
      path: "chat",
      populate: { path: "users", select: "name picture email" },
    })
    .populate("reply");


    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);

  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     delkete Message
//@route           DELETE /message/
//@access          Protected

const deleteMessage = async (req,res) => {
  const userId = req.user._id
  const messageId = req.params.messageId
  try {
    const deletedMessage = await Message.findByIdAndDelete(messageId).populate("chat")
    console.log("deleted message is")
    console.log(deletedMessage)
    if (deletedMessage.chat.latestMessage && deletedMessage.chat.latestMessage.toString() === messageId)
    {
      // get latest message after deletion
      const latestMessage = await Message.findOne({chat: deletedMessage.chat._id})
      .sort({ createdAt: -1 })
  
      if (latestMessage) {
        await Chat.findByIdAndUpdate(deletedMessage.chat._id, {
          latestMessage: latestMessage._id,
        })
      } else {
        
        await Chat.findByIdAndUpdate(deletedMessage.chat._id, {
          $unset: { latestMessage: "" },
        })
      }     
    }

    res.json({
      success: true,
      deletedMessage,
    })
   
  } catch (error) {
    res.status(500).json({success:false, message:error.message})
  }
}

export { allMessages, sendMessage, deleteMessage };