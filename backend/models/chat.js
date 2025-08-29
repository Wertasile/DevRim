const mongoose = require('mongoose')

const Schema = mongoose.Schema

const chatModel = Schema(
    {
        chatName : { type: String, trim: true},
        isGroupChat : { type: Boolean, default: false},
        users:[{
            type:Schema.Types.ObjectId,
            ref: "user",
        }],
        latestMessage: {type: Schema.Types.ObjectId, ref: "message"},
        groupAdmin: {type: Schema.Types.ObjectId, ref: "user"}
 
    },
    {
        timestamps: true
    }
)

const Chat = mongoose.model("Chat",chatModel)

module.exports = Chat