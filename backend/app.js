import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "./authentication.js";
import { toNodeHandler } from "better-auth/node";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import authenticateUser from "./functions/auth.js";
import User from "./models/user.js";
import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";

import postsRouter from "./routes/postRoutes.js";
import usersRouter from "./routes/userRoutes.js";
import chatsRouter from "./routes/chatRoutes.js";
import commentsRouter from "./routes/commentRoutes.js";
import messagesRouter from "./routes/messageRoutes.js";
import listsRouter from "./routes/listRoutes.js";
import logsRouter from "./routes/logRoutes.js";
import analyticsRouter from "./routes/userAnalyticsRoutes.js";
import statusRouter from "./routes/statusRoutes.js";
import communitiesRouter from "./routes/communityRoutes.js";

dotenv.config();

// 🔹 Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


var app = express();

var client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'postmessage',
);

// CONNECTING TO MONGODB DATABASE
async function connectToDB () {
  try {
    await mongoose.connect(process.env.MONGO_DB, {})
    
    console.log("Successfully Connected to Database")
  } catch (err) {
    console.log(`error ${err}`)
  }
}

const isProduction = process.env.NODE_ENV === "production";

// -------------------- GOOGLE SIGN IN - SIGN OUT - GOOGLE TOKEN MANAGEMENT ----------------------------------------------------------------------------------------//
async function connectToGoogle (req,res) {
  const { tokens } = await client.getToken(req.body.code.code)
  console.log("Tokens from Google:", tokens);

  const idToken = tokens.id_token

  try {

    // verifyIdToken return a Login Ticket which has property payload and method getPayload()

    const ticket = await client.verifyIdToken(
      {
        idToken : idToken,
        audience : process.env.CLIENT_ID
      }
    )

    // payload consist of serveral properties sub(userid), email, name, picture, etc..

    const payload = ticket.getPayload()

    const googleId = payload.sub
    
    let user = await User.findOne({ googleId });

    if (!user){
      user = await User.create({
        googleId: payload.sub,
        family_name: payload.family_name,
        given_name: payload.given_name,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      })
    }

    // creating JWT token with our secret
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    console.log("Setting cookie with SameSite:", isProduction ? "none" : "lax");

    // return a http only cookie
    res.cookie("token", jwtToken, {
      secure: isProduction,             // only secure in prod
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({success: true})
    
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid token' });
  }
  res.json(tokens)
}

async function LogoutFromGoogle (req,res) {
  
    // clear the cookie that we have, i.e.
    res.clearCookie("token", {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax"
    });

    res.json({success: true})
}

const getPersonalData = async (req, res) => {
  // No need for next() here

  console.log("✅ Request user:", req.user);

  res.json({
    _id: req.user._id,
    googleId: req.user.googleId, // 👈 fixed: was req.id.googleId (typo)
    name: req.user.name,
    given_name: req.user.given_name,
    family_name: req.user.family_name,
    email: req.user.email,
    picture: req.user.picture,
    byline: req.user.byline,
    about: req.user.about,
    liked: req.user.liked,
    lists: req.user.lists,
    following: req.user.following,
    followers: req.user.followers,
    connections: req.user.connections,
    communities: req.user.communities,
    requestsSent: req.user.requestsSent,
    requestsReceived: req.user.requestsReceived
  });
};



connectToDB()



// -------------------- CROSS ORIGIN RESOURCE SHARING SETTINGS ------------------------------------------------------------------------------------------------------------

const allowedOrigins = [
  'https://devrim-seven.vercel.app',        // production frontend
  'http://localhost:5173',    // local React/Vite/Next dev server
  'http://127.0.0.1:5173'     // optional: some setups use 127.0.0.1 instead of localhost
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


app.options("*", cors());

// ------------------------ ADDITION OF VARIOUS MIDDLEWARES ----------------------------------------------------------------------------------------------------------------
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// -------------------------- ALL ROUTES ------------------------------------------------------------------------------------------------------------------------------------
app.use("/posts", postsRouter);
app.use("/users", usersRouter);
app.use("/chats", chatsRouter);
app.use("/comments", commentsRouter);
app.use("/messages", messagesRouter);
app.use("/lists", listsRouter);
app.use("/logs", logsRouter);
app.use("/analytics", analyticsRouter);
app.use("/status", statusRouter);
app.use("/communities", communitiesRouter);

//google authentication
app.post("/auth/google", connectToGoogle)
app.get("/me", authenticateUser, getPersonalData)
app.post("/logout", LogoutFromGoogle) 
app.all("/api/auth/*", toNodeHandler(auth));
//app.post("/auth/google/refresh-token", refreshTokenGoogle)

// --------------------------- ARCJET STUFF ---------------------------------------------------------------------------------------------------------------------------------
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket RATE LIMIT. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      characteristics: ["ip.src"],
      refillRate: 10, // Refill 5 tokens per interval
      interval: 60, // Refill every 10 seconds
      capacity: 100, // Bucket capacity of 10 tokens
    }),
  ],
});

app.get("/", async (req, res) => {
  const decision = await aj.protect(req, { requested: 5 }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Too Many Requests" }));
    } else if (decision.reason.isBot()) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No bots allowed" }));
    } else {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Forbidden" }));
    }
  } else if (decision.ip.isHosting()) {
    // Requests from hosting IPs are likely from bots, so they can usually be
    // blocked. However, consider your use case - if this is an API endpoint
    // then hosting IPs might be legitimate.
    // https://docs.arcjet.com/blueprints/vpn-proxy-detection
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden" }));
  } else if (decision.results.some(isSpoofedBot)) {
    // Paid Arcjet accounts include additional verification checks using IP data.
    // Verification isn't always possible, so we recommend checking the decision
    // separately.
    // https://docs.arcjet.com/bot-protection/reference#bot-verification
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Forbidden" }));
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello World" }));
  }
});

// --------------------------- S3 FILE UPLOAD STUFF -------------------------------------------------------------------------------------------------------------------------

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
});

// ----------------------------- GENERATING PRESIGNED URL FOR UPLOADING --------------------------------------------------------------------------------------------------
app.get("/s3/presign-upload", async (req, res) => {
  try {
    const { filename, contentType, type } = req.query;

    let bucket = process.env.S3_BUCKET_FILE;
    // if (type === "audio") bucket = process.env.S3_BUCKET_AUDIO;
    // else if (type === "image") bucket = process.env.S3_BUCKET_IMAGE;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 min

    res.json({ uploadUrl, key: filename });
  } catch (err) {
    console.error("Error generating presigned upload URL:", err);
    res.status(500).json({ error: "Failed to generate presigned upload URL" });
  }
});

// --------------------------------- GENERATING A PRESIGNED URL FOR DOWNLOADING --------------------------------------------------------------------------------------------
app.get("/s3/presign-download", async (req, res) => {
  try {
    const { filename } = req.query;

    if (!filename) return res.status(400).json({ error: "Filename is required" });

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_FILE, // single bucket
      Key: filename,
    });

    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 60 }); // 1 hour

    res.json({ downloadUrl });
  } catch (err) {
    console.error("Error generating presigned download URL:", err);
    res.status(500).json({ error: "Failed to generate presigned download URL" });
  }
});

// ----------------------------- GENERATING PRESIGNED URL FOR UPLOADING IMAGE ON TIPTAP--------------------------------------------------------------------------------------------------
app.get("/s3/tiptap-image-upload", async (req, res) => {
  console.log("Upload request received:", req.query); // ✅
  try {
    
    const { filename, contentType } = req.query;

    let bucket = process.env.S3_TIPTAP_BUCKET;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 min

    const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

    res.json({ uploadUrl, fileUrl, key: filename });
  } catch (err) {
    console.error("Error generating presigned upload URL:", err);
    res.status(500).json({ error: "Failed to generate presigned upload URL" });
  }
});

// ----------------------------- GENERATING PRESIGNED URL FOR UPLOADING IMAGE ON community creation--------------------------------------------------------------------------------------------------
app.get("/s3/community-image-upload", async (req, res) => {
  console.log("Upload request received:", req.query);
  try {
    
    const { filename, contentType } = req.query;

    if (!filename || !contentType) {
      return res.status(400).json({ error: "Filename and contentType are required" });
    }

    const bucket = process.env.S3_COMMUNITY_IMAGE_BUCKET;
    
    if (!bucket) {
      console.error("S3_COMMUNITY_IMAGE_BUCKET environment variable is not set");
      return res.status(500).json({ error: "S3 bucket configuration is missing" });
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 min

    const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

    res.json({ uploadUrl, fileUrl, key: filename });
  } catch (err) {
    console.error("Error generating presigned upload URL:", err);
    res.status(500).json({ error: "Failed to generate presigned upload URL", details: err.message });
  }
});

// ----------------------------- GENERATING PRESIGNED URL FOR UPLOADING PROFILE PICTURE--------------------------------------------------------------------------------------------------
app.get("/s3/profile-picture-upload", async (req, res) => {
  console.log("Profile picture upload request received:", req.query);
  try {
    
    const { filename, contentType } = req.query;

    if (!filename || !contentType) {
      return res.status(400).json({ error: "Filename and contentType are required" });
    }

    // Use the general file bucket for profile pictures, or create a dedicated bucket env var
    const bucket = process.env.S3_BUCKET_FILE;
    
    if (!bucket) {
      console.error("S3_BUCKET_FILE environment variable is not set");
      return res.status(500).json({ error: "S3 bucket configuration is missing" });
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }); // 5 min

    const fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;

    res.json({ uploadUrl, fileUrl, key: filename });
  } catch (err) {
    console.error("Error generating presigned upload URL:", err);
    res.status(500).json({ error: "Failed to generate presigned upload URL", details: err.message });
  }
});

// ------------------------------------------ SOME DEFAULT STUFF ------------------------------------------------------------------------------------------------------------

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({ error: err.message });
  // res.render('error');
});

export default app;
