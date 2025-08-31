const mongoose = require('mongoose')

const Schema = mongoose.Schema

const commentModel = Schema(
    {
        blog: {type: Schema.Types.ObjectId, ref: "post"},
        comment: {type: String},
        user: {type: Schema.Types.ObjectId, ref:"user"},
    },
    {
        timestamps: true
    }
)

const comment = mongoose.model("comment", commentModel)

module.exports = comment