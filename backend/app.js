var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const {OAuth2Client, UserRefreshClient} = require('google-auth-library');
const User = require("./models/user");
const authenticateUser = require('./functions/auth');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


var app = express();

var client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'postmessage',
);

// CONNECTING TO MONGODB DATABASE
async function connectToDB () {
  await mongoose.connect(process.env.MONGO_DB, {})
  .then((result) => {
    console.log("Successfully Connected to Database")
  }).catch((err) => {
    console.log(`error ${err}`)
  });
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
    liked: req.user.liked,
    lists: req.user.lists,
    following: req.user.following,
    followers: req.user.followers,
    connections: req.user.connections,
    requests: req.user.requests
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
app.use('/posts', require('./routes/postRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/chats', require('./routes/chatRoutes'));
app.use('/comments', require('./routes/commentRoutes'));
app.use('/messages', require('./routes/messageRoutes'));
app.use('/lists', require('./routes/listRoutes'));
app.use('/logs', require('./routes/logRoutes'));
app.use('/analytics', require('./routes/userAnalyticsRoutes'));

//google authentication
app.post("/auth/google", connectToGoogle)
app.get("/me", authenticateUser, getPersonalData)
app.post("/logout", LogoutFromGoogle) 
//app.post("/auth/google/refresh-token", refreshTokenGoogle)

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

module.exports = app;
