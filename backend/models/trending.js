const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const trendingSchema = new Schema({
    type: { type: String, required:true}, // hourly (or) daily
    posts: [{ blog: Schema.Types.ObjectId, score: Number }],
    updatedAt: { type: Date, default: Date.now() }
})

const trending = mongoose.model("trending", trendingSchema)

module.exports = trending;