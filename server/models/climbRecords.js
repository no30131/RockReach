const mongoose = require("mongoose");
const { Schema } = mongoose;

const climbRecordSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    date: { type: Date, required: true },
    gymId: { type: Schema.Types.ObjectId, ref: 'gyms', required: true },
    wall: String,
    level: String,
    type: String,
    times: Number,
    memo: String,
    files: [String],
});

const ClimbRecords = mongoose.model("climbRecords", climbRecordSchema);
module.exports = ClimbRecords;