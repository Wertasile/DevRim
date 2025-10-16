const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const trendingSchema = new Schema({
  type: { type: String, enum: ["hourly", "daily", "weekly"], required: true },
  posts: [{
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "post" },
    score: Number
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("trending", trendingSchema);
