const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {type: String, required: true},
    summary: {type: String, required: true},
    content: {type: Object, required: true},
    releaseDate : {type: Date}, // we use form with type: date-time local
    user: {type: Schema.Types.ObjectId, ref: "user"},
    comments: [{type: Schema.Types.ObjectId, ref:"comment"}],
    likes: [{type: Schema.Types.ObjectId, ref:"user"}],
    categories: [{type: String}]
})

const post = mongoose.model("post", postSchema)

module.exports = post;