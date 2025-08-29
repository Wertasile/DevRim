const mongoose = require('mongoose');

const Schema = mongoose.Schema

const messageModel = Schema({

    sender : {type: Schema.Types.ObjectId, ref:"user"},
    content : {type:String, trim:true},
    chat : {type: Schema.Types.ObjectId, ref:"Chat"},
    messagetype: {type:String},
    url: {type:String}
},{
    timestamps:true
})

const Message = mongoose.model("Message",messageModel)

module.exports = Message