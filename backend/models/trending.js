import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const trendingSchema = new Schema({
  type: { type: String, enum: ["hourly", "daily", "weekly"], required: true },
  posts: [{
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
    score: Number
  }],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("trending", trendingSchema);
