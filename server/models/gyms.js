const mongoose = require("mongoose");
const { Schema } = mongoose;

const gymSchema = new Schema({
    name: { type: String, unique: true, required: true },
    phone: String,
    address: String,
    latitude: Number,
    longitude: Number,
  });

const Gym = mongoose.model("gyms", gymSchema);
module.exports = Gym;