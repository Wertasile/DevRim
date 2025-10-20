const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  family_name: String,
  given_name: String,
  email: String,
  name: String,
  picture: String,
  liked: [{type: mongoose.Schema.Types.ObjectId, ref:"post"}],
  lists: [{type: mongoose.Schema.Types.ObjectId, ref:"list"}],
  following: [{type: mongoose.Schema.Types.ObjectId, ref:"user"}],
  followers: [{type: mongoose.Schema.Types.ObjectId, ref:"user"}],
  connections: [{type: mongoose.Schema.Types.ObjectId, ref:"user"}],
  requestsSent: [{type: mongoose.Schema.Types.ObjectId, ref:"user"}],
  requestsReceived: [{type: mongoose.Schema.Types.ObjectId, ref:"user"}]
});

module.exports = mongoose.model('user', userSchema);