const mongoose = require("mongoose");
const { Schema } = mongoose;

const customsSchema = new Schema({
  wallName: { type: String, unique: true, required: true },
  originalImage: { type: String, required: true },
  type: { type: String, required: true },
  customs: [{
    processedImage: String,
    setter: String,
    customName: String,
    customType: [ String ],
    achievementStatus: String,
    memo: String,
  }],
});

const Customs = mongoose.model("customs", customsSchema);
module.exports = Customs;
