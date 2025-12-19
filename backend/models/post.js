import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {type: String, required: true},
    summary: {type: String, maxLength: 250, default: undefined}, // Optional, max 250 chars
    content: {type: Object, required: true},
    releaseDate : {type: Date}, // we use form with type: date-time local
    user: {type: Schema.Types.ObjectId, ref: "user"},
    comments: [{type: Schema.Types.ObjectId, ref:"comment"}],
    likes: [{type: Schema.Types.ObjectId, ref:"user"}],
    categories: [{type: String}]
})

export default mongoose.model("post", postSchema);