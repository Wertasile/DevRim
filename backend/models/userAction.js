const mongoose = require('mongoose')

const userActionSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref:"user"},
    action : {
        type: String,
        enum: ["like", "comment", "share", "follow", "view"],
        required: true
    },
    blog: {type: mongoose.Schema.Types.ObjectId, ref:"post"},
    timestamp: { type: Date, default: Date.now()},
    duration: { type: Number, default: 0}
})

module.exports = mongoose.Model("userAction", userActionSchema)

