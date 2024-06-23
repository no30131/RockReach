const Footprints = require("../models/footprints");

exports.getUserById = async (req, res) => {
    try {
        const footprints = await Footprints.find({ userId: req.params.userId }).populate("gymId");
        res.json(footprints);
    } catch (error) {
        res.status(500).json({ error: "Error fetching footprints" });
    }
};