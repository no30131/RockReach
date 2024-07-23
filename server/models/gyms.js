const mongoose = require("mongoose");
const { Schema } = mongoose;

const gymSchema = new Schema({
    name: { type: String, unique: true, required: true },
    phone: String,
    address: String,
  });

const Gym = mongoose.models.gyms || mongoose.model("gyms", gymSchema);

module.exports = Gym;