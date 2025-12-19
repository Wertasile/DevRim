import mongoose from 'mongoose';

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

export default mongoose.model("list", listModel)

