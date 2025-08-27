const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: String,
  family_name: String,
  given_name: String,
  email: String,
  name: String,
  picture: String,
});

module.exports = mongoose.model('user', userSchema);