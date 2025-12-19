import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const LogSchema = new Schema({

    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    event: {
        type: String,
        enum: ["comment", "share", "follow", "view_blog", "like_blog", "bookmark_blog"],
        required: true
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now }
    
})

// {
//   user: ObjectId,        // the acting user
//   event: String,         // enum: "view_blog", "like_blog", ...
//   metadata: {            // always store ids (not full objects)
//     blog?: ObjectId,
//     targetUser?: ObjectId,
//     duration?: Number,
//     ...other small fields (primitives only)
//   },
//   timestamp: Date
// }


// useful indexes
LogSchema.index({ user: 1, timestamp: -1 });                          // to find a user's recent activity
LogSchema.index({ "metadata.postId": 1, event: 1, timestamp: -1 });     // to find all view events for a particular post
LogSchema.index({ event: 1, timestamp: -1 });                           // based on event, and based on recency, it is categorised

export default mongoose.model("log", LogSchema)



