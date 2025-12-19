import mongoose from 'mongoose'
const { Schema } = mongoose

const communitySchema = new Schema({
    title: {type: String, maxLength: 50, required: true},
    description: {type: String, maxLength: 250},
    creator: {type: Schema.Types.ObjectId, ref:"user", required: true},
    moderators: [{type: Schema.Types.ObjectId, ref:"user"}],
    rules: [{type: String, maxLength: 100}],
    picture: {type: String},
    members: [{type: Schema.Types.ObjectId, ref:"user"}],
    posts: [{type: Schema.Types.ObjectId, ref:"post"}]
},
{
    timestamps: true
})

export default mongoose.model("community", communitySchema)