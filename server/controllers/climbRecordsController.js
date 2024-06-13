const ClimbRecords = require("../models/climbRecords");

exports.createClimbRecords = async (req, res) => {
    const { userId, date, gymId, wall, level, type, times, memo, files } = req.body;
    try {
        const climbRecords = new ClimbRecords({ userId, date, gymId });
        await climbRecords.save();
        res.status(201).send(climbRecords);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.getClimbRecordsById = async (req, res) => {
    const climbRecordsId = req.params.id;
    try {
        const climbRecords = await ClimbRecords.findById(climbRecordsId);
        if (!climbRecords) {
            return res.status(404).json({ error: "Climb records not found" });
        }
        res.status(200).send(climbRecords);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};