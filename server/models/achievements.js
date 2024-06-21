const mongoose = require("mongoose");
const { Schema } = mongoose;

const achievementsSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    customName: { type: String, required: true },
    status: { type: String, required: true },
});

const Achievements = mongoose.model("achievements", achievementsSchema);
module.exports = Achievements;