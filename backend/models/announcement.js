import mongoose from 'mongoose'
const { Schema } = mongoose

const announcementSchema = new Schema({
    title: {type: String, required: true, maxLength: 100},
    content: {type: String, required: true, maxLength: 500},
    community: {type: Schema.Types.ObjectId, ref:"community", required: true},
    createdBy: {type: Schema.Types.ObjectId, ref:"user", required: true},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
})

export default mongoose.model("announcement", announcementSchema)




















