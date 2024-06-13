const mongoose = require("mongoose");
const { Schema } = mongoose;

const mapSchema = new Schema({
    gymId: { type: Schema.Types.ObjectId, ref: 'gyms', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    lastVisit: Date,
    visitTimes: Number,
    expiryDate: Date,
});

const Maps = mongoose.model("maps", mapSchema);
module.exports = Maps;