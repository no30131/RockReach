const mongoose = require("mongoose");
const { Schema } = mongoose;

const footprintsSchema = new Schema({
    gymId: { type: Schema.Types.ObjectId, ref: 'gyms', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    lastVisit: Date,
    visitTimes: Number,
    expiryDate: Date,
});

const Footprints = mongoose.model("maps", footprintsSchema);
module.exports = Footprints;