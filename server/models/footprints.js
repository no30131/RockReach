const mongoose = require("mongoose");
const { Schema } = mongoose;

const footprintsSchema = new Schema({
    gymId: { type: Schema.Types.ObjectId, ref: 'gyms', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    expiryDate: String,
});

const Footprints = mongoose.model("footprints", footprintsSchema);
module.exports = Footprints;