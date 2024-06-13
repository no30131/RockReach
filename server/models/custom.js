const mongoose = require("mongoose");
const { Schema } = mongoose;

const customSchema = new Schema({
    gymId: { type: Schema.Types.ObjectId, ref: 'gyms', required: true },
    wall: String,
    originalImage:  { type: String, required: true },
    processedImage: String,
    customName: String,
    customType: String,
    achievementStatus: String,
    memo: String,
  });

const Custom = mongoose.model("custom", customSchema);
module.exports = Custom;