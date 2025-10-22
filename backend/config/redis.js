const { createClient } = require("redis");
require('dotenv').config();

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

client.on("connect", () => console.log("✅ Connected to Redis"));
client.on("error", (err) => console.log("❌ Redis Client Error:", err));

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

connectRedis(); // ✅ call the function (no top-level await)

module.exports = client; // ✅ CommonJS export
