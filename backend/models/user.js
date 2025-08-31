const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  family_name: String,
  given_name: String,
  email: String,
  name: String,
  picture: String,
  liked: [{type: mongoose.Schema.Types.ObjectId, ref:"post"}],
  lists: [{type: mongoose.Schema.Types.ObjectId, ref:"list"}]
});

module.exports = mongoose.model('user', userSchema);