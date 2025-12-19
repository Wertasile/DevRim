import mongoose from 'mongoose';

const Schema = mongoose.Schema

const commentModel = Schema(
    {
        blog: {type: Schema.Types.ObjectId, ref: "post"},
        comment: {type: String},
        user: {type: Schema.Types.ObjectId, ref:"user"},
        replyTo: {type: Schema.Types.ObjectId, ref: "comment", default: null},
    },
    {
        timestamps: true
    }
)

export default mongoose.model("comment", commentModel)
