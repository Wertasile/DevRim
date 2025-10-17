// cron job
const cron = require("node-cron")
const Post = require("../models/post")
const Log = require("../models/log")
const Trending = require("../models/trending")

function aggregateStats () {
    cron.schedule("0 * * * *", async () => {

        try {
            const ONE_WEEK_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const trending = await Log.aggregate([
                {
                    $match: { event : { $in : ["view_blog","like_blog"] }, timestamp: { $gte: ONE_WEEK_AGO }}
                },
                {
                    $group: { _id:"$metadata.blog" , score: { $sum:1 } }
                },
                {
                    $sort: { score: -1}
                },
                {
                    $limit: 50
                }
            ])

            // get the trending aggregate and then save it to Trending Collection

            if (trending && trending.length) {

                await Trending.replaceOne(
                { type: "hourly" },
                { 
                    type: "hourly",
                    posts: trending.map(t => ({ blog: t._id, score: t.score })),
                    updatedAt: new Date()
                },
                { upsert: true }
                );

                // 2️⃣ Fetch and populate the newly updated document
                const populatedTrending = await Trending.findOne({ type: "hourly" })
                .populate({
                    path: "posts.blog",
                    select: "title summary releaseDate user comments likes",
                    populate: {
                    path: "user",
                    select: "name picture"
                    }
                })
                .exec();
            }

            console.log("aggregateStats: trending updated", populatedTrending.slice(0, 5));
        } catch (error) {
            console.error("aggregateStats error:", error);
        }
    })
    console.log("Cron job runs hourly and is scheduled")

}

setInterval(() => {
  console.log("⏱️ Cron worker alive at", new Date().toISOString());
}, 60 * 1000);


module.exports = aggregateStats