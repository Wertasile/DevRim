// cron job
const cron = require("node-cron")
const Post = require("../models/post")
const Log = require("../models/log")
const Trending = require("../models/trending")

cron.schedule("0 * * * *", async () => {

    try {
        const oneDayAgo = new Date( Date.now() - ( 1000 * 60 * 60 * 24 ))

        const trending = await Log.aggregate([
            {
                $match: { event : { $in : ["view_blog","like_blog"] }, timestamp: { $gte: oneDayAgo }}
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
                { 
                    type: "hourly" 
                },
                { 
                    type: "hourly", posts: trending.map(t => ({ blog: t._id, score: t.score })), updatedAt: new Date() 
                },
                { 
                    upsert: true 
                }
            )

        }

        console.log("aggregateStats: trending updated", trending.slice(0, 5));
    } catch (error) {
        console.error("aggregateStats error:", error);
    }

})