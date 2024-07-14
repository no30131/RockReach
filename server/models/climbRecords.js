const mongoose = require("mongoose");
const { Schema } = mongoose;
 
const climbRecordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  date: { type: String, required: true },
  gymName: { type: String, required: true },
  records: [
    {
      wall: { type: String },
      level: { type: String, required: true },
      types: { type: [String] },
      times: { type: Number },
      memo: { type: String },
      files: { type: [String] },
      likes: { type: Number, default: 0 },
      comments: { type: [String], default: [] },
      likedBy: [{ type: Schema.Types.ObjectId, ref: "users", default: [] }]
    },
  ],
});

const ClimbRecords = mongoose.model("climbRecords", climbRecordSchema);
module.exports = ClimbRecords;
 