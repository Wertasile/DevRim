import dotenv from "dotenv";
import mongoose from "mongoose";
import startAggregationJob from "./jobs/aggregateStats.js";

dotenv.config();

mongoose.connect(process.env.MONGO_DB)
  .then(() => {
    console.log("Connected to MongoDB ✅");
    startAggregationJob();
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });
