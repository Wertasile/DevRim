import mongoose from 'mongoose';

const Schema = mongoose.Schema

const chatModel = Schema(
    {
        chatName : { type: String, trim: true},
        isGroupChat : { type: Boolean, default: false},
        users:[{
            type:Schema.Types.ObjectId,
            ref: "user",
        }],
        latestMessage: {type: Schema.Types.ObjectId, ref: "Message"},
        groupAdmin: {type: Schema.Types.ObjectId, ref: "user"},
        pinned: [{type: Schema.Types.ObjectId, ref: "Message"}]
 
    },
    {
        timestamps: true
    }
)

export default mongoose.model("Chat",chatModel)

