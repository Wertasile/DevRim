import mongoose from 'mongoose';

const Schema = mongoose.Schema

const messageModel = Schema({

    sender : {type: Schema.Types.ObjectId, ref:"user"},
    content : {type:String, trim:true},
    chat : {type: Schema.Types.ObjectId, ref:"Chat"},
    messageType: {type:String},
    url: {type:String},
    reply: {type: Schema.Types.ObjectId, ref:"Message"}
},{
    timestamps:true
})

export default mongoose.model("Message",messageModel)

