require("dotenv").config();
const mongoose = require("mongoose");
const startAggregationJob = require("./jobs/aggregateStats");

mongoose.connect(process.env.MONGO_DB)
  .then(() => {
    console.log("Connected to MongoDB ✅");
    startAggregationJob();
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });
