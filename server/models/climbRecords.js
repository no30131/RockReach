const mongoose = require("mongoose");
const { Schema } = mongoose;

// const recordSchema = new Schema({
//   wall: { type: String, required: true },
//   level: { type: String, required: true },
//   types: { type: [String], required: true },
//   times: { type: Number, required: true },
//   memo: { type: String, required: false },
//   files: { type: [String], required: false }
// });

// const climbRecordSchema = new Schema({
//   userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
//   date: { type: Date, required: true },
//   gymId: { type: Schema.Types.ObjectId, ref: "gyms", required: true },
//   records: [recordSchema]
// });

const climbRecordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  date: { type: String, required: true },
  gymId: { type: Schema.Types.ObjectId, ref: "gyms", required: true },
  records: [
    {
      wall: { type: String, required: true },
      level: { type: String, required: true },
      types: { type: [String], required: true },
      times: { type: Number, required: false },
      memo: { type: String, required: false },
      files: { type: [String], required: false },
    },
  ],
});

const ClimbRecords = mongoose.model("climbRecords", climbRecordSchema);
module.exports = ClimbRecords;
