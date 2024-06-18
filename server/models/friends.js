const mongoose = require("mongoose");
const { Schema } = mongoose;

const friendSchema = new Schema({
  inviterId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  friendDate: { type: String, required: true },
  chat: [
    {
      time: { type: String, required: true },
      talker: { type: Schema.Types.ObjectId, ref: 'users' },
      message: { type: String },
      image: String,
    }, { _id: false }
  ]
});

const Friends = mongoose.model("friends", friendSchema);
module.exports = Friends;