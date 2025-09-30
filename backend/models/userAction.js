const mongoose = require('mongoose')

const userActionSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref:"user"},
    action : {
        type: String,
        enum: ["like", "comment", "share", "follow", "view"],
        required: true
    },
    post: {type: mongoose.Schema.Types.ObjectId, ref:"post"}
})

module.exports = mongoose.Model("userAction", userActionSchema)

