const Footprints = require("../models/footprints");

exports.createOrUpdateFootprint = async (req, res) => {
    const { gymId, userId, lastVisit, visitTimes, expiryDate } = req.body;
    
    try {
      const footprint = await Footprints.findOneAndUpdate(
        { userId, gymId },
        { lastVisit, visitTimes, expiryDate },
        { new: true, upsert: true}
      );

      res.status(200).json(footprint);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.getFootprintByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
      const footprints = await Footprints.find({ userId }).populate("gymId");
      res.status(200).send(footprints);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
};