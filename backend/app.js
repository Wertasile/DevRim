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


var app = express();

var client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'postmessage',
);


async function connectToDB () {
  await mongoose.connect(process.env.MONGO_DB)
  .then((result) => {
    console.log("Successfully Connected to Database")
  }).catch((err) => {
    console.log(`error ${err}`)
  });
}

async function connectToGoogle (req,res) {
  const { tokens } = await client.getToken(req.body.code)

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

    // return a http only cookie
    res.cookie('token', jwtToken, {
      secure: false,
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({success: true})
    
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid token' });
  }
  res.json(tokens)
}

async function LogoutFromGoogle (req,res) {
  
    // clear the cookie that we have, i.e.
    res.clearCookie('token', {
      secure: false,
      httpOnly: true,
      sameSite: 'Lax',
    })

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
    picture: req.user.picture
  });
};

// async function refreshTokenGoogle (req,res) {
//   const user = new UserRefreshClient(clientId, clientSecret, req.body.refreshToken)
//   const { credentials } = await user.refreshAccessToken();
//   res.json(credentials)
//}

connectToDB()

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({origin: 'http://localhost:5173',
  credentials: true
}));
app.options('*', cors());

app.use('/posts', require('./routes/postRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/chats', require('./routes/chatRoutes'));
app.use('/messages', require('./routes/messageRoutes'));
// app.use('/aws', require('./routes/awsRoutes'));

//google authentication
app.post("/auth/google", connectToGoogle)
app.get("/me", authenticateUser, getPersonalData)
app.post("/logout", LogoutFromGoogle) 
//app.post("/auth/google/refresh-token", refreshTokenGoogle)

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
