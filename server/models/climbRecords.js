const mongoose = require("mongoose");
const { Schema } = mongoose;

const climbRecordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  date: { type: String, required: true },
  gymName: { type: String, required: true },
  records: [
    {
      wall: { type: String, required: true },
      level: { type: String, required: true },
      types: { type: [String], required: true },
      times: { type: Number, required: false },
      memo: { type: String, required: false },
      files: { type: [String], required: false },
      likes: { type: Number, default: 0 },
      comments: { type: [String], default: [] } 
    },
  ],
});

const ClimbRecords = mongoose.model("climbRecords", climbRecordSchema);
module.exports = ClimbRecords;
