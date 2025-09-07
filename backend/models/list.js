const mongoose = require('mongoose')

const Schema = mongoose.Schema

const listModel = Schema(
    {
        blogs: [{type: Schema.Types.ObjectId, ref: "post"}],
        name: {type: String},
        user: {type: Schema.Types.ObjectId, ref:"user"},
    },
    {
        timestamps: true
    }
)

const list = mongoose.model("list", listModel)

module.exports = list