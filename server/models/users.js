const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  provider: { type: String, required: true },
  public: { type: String, required: true },
  introduce: String,
  image: String,
});

const User = mongoose.models.users || mongoose.model('users', userSchema);
module.exports = User;
