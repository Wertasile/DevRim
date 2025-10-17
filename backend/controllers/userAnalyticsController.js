const Log = require('../models/log')
const Post = require("../models/post");


// GET /analytics/history
const getHistory = async ( req, res ) => {
    
    try {
        const userId = req.user._id
        const limit = Math.min( 100 , parseInt(req.query.limit || 20, 10 ))

        const history = await Log.find({ user: userId , event: "view_blog"}).sort({ timestamp: -1}).limit(limit).lean()

        // fetch post data

        const blogIds = history.map( (h) => h.metadata.blog).filter(boolean)

        const blogs = await Post.find({ _id : { $in: blogIds } })

        // preservijng the order of history
        const blogsById = blogs.reduce((acc, p) => { acc[p._id.toString()] = p; return acc; }, {});
        const result = blogIds.map(id => blogsById[id.toString()] || null).filter(Boolean);
        res.json(result)
    } catch (error) {
        res.status(500).json({ success:false, message: "server error"})
    }

}

// GET /analytics/summary
const getSummary = async ( req, res ) => {
    
    try {
        const userId = req.user._id

        const aggregate = await Log.aggregate([
            {
                $match : { user : userId}
            },
            {
                $group : { _id : "$event" , count : { $sum: 1 } }
            }
        ])
        // result of aggregate would be [ {view_blog : 2 , like : 15} ]

        // coverting to an object map where key:value ==> event:count 
        const summary = {}
        aggregate.forEach( agg => summary[agg._id] = agg.count)

        res.status(200).json(summary)

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }

}
// GET /analytics/recommendations/
const getRecommendation = async ( req,res ) => {

  try {
    const userId = req.user && req.user._id;
    
    const limit = Math.min(50, parseInt(req.query.limit || 10, 10));

    // 1) find top categories (tags) the user engaged with
    const tagsAgg = await Log.aggregate([
      { $match: { user: userId, event: { $in: ["view_blog", "like_blog", "bookmark_blog"] } } },
      { $lookup: { from: "posts", localField: "metadata.blog", foreignField: "_id", as: "post" } },
      { $unwind: "$post" },
      { $unwind: "$post.categories" },
      { $group: { _id: "$post.categories", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topTags = tagsAgg.map(t => t._id).filter(Boolean);

    if (!topTags.length) {
      // fallback: pull from Trending collection or compute quickly
      const trending = await Log.aggregate([
        { $match: { event: "view_blog", timestamp: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } } },
        { $group: { _id: "$metadata.blog", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: limit }
      ]);
      const ids = trending.map(t => t._id).filter(Boolean);
      const posts = await Post.find({ _id: { $in: ids } }).limit(limit).lean();
      return res.json(posts);
    }

    // 2) find posts in those categories that user hasn't already viewed/liked/bookmarked
    const seen = await Log.find({ user: userId, event: { $in: ["view_blog", "like_blog", "bookmark_blog"] } })
      .distinct("metadata.blog");

    const recommendations = await Post.find({
      categories: { $in: topTags },
      _id: { $nin: seen }
    })
      .populate("title summary releaseDate user comments likes")
      .sort({ releaseDate: -1 })
      .limit(limit)
      .lean();

    return res.json(recommendations);
  } catch (err) {
    console.error("getRecommendation error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getSummary, getHistory, getRecommendation }