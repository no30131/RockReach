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

// friendSchema.pre('save', async function(next) {
//   if (this.chat && this.chat.length > 0) {
//     for (let i = 0; i < this.chat.length; i++) {
//       if (!this.chat[i].chatId) {
//         const maxChat = await this.constructor.findOne().sort('-chat.chatId').select('chat.chatId');
//         const maxChatId = maxChat ? maxChat.chat[0].chatId : 0;
//         this.chat[i].chatId = maxChatId + 1;
//       }
//     }
//   }
//   next();
// });

const Friends = mongoose.model("friends", friendSchema);
module.exports = Friends;