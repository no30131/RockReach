const mongoose = require("mongoose");
const { Schema } = mongoose;

const friendSchema = new Schema({
    inviterId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    friendDate: { type: Date, default: Date.now },
    chat: {
      chatId: { type: Number, unique: true },
      time: { type: Date, default: Date.now },
      talker: { type: String, unique: true },
      message: { type: String, unique: true },
      image: String,
    },
  });

const Friends = mongoose.model("friends", friendSchema);
module.exports = Friends;