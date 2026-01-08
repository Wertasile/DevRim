import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: String,
  password: String, // For email/password authentication
  family_name: String,
  given_name: String,
  email: { type: String, unique: true, required: true },
  emailVerified: { type: Boolean, default: false },
  name: String,
  picture: String,
  byline: String,
  about: String,
  liked: [{type: mongoose.Schema.Types.ObjectId, ref:"post"}],
  lists: [{type: mongoose.Schema.Types.ObjectId, ref:"list"}],
  following: [{type: mongoose.Schema.Types.ObjectId, ref:"user"}],
  followers: [{type: mongoose.Schema.Types.ObjectId, ref:"user"}],
  connections: [{type: mongoose.Schema.Types.ObjectId, ref:"user"}],
  requestsSent: [{type: mongoose.Schema.Types.ObjectId, ref:"user"}],
  requestsReceived: [{type: mongoose.Schema.Types.ObjectId, ref:"user"}],
  communities: [{type: mongoose.Schema.Types.ObjectId, ref:"community"}],
  status: {type:String, enum: ["online","offline"], default:"offline"},
  lastSeen: {type: Date, default:null}
});

export default mongoose.model('user', userSchema);