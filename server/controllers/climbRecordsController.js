const ClimbRecords = require("../models/climbRecords");

exports.createClimbRecords = async (req, res) => {
  try {
    const { userId, date, gymId } = req.body;
    const records = JSON.parse(req.body.records);
    const files = req.files;

    if (!files || files.length === 0) {
      console.log("No files uploaded");
    }
    const filePaths = files.map((file) => file.path);

    const updatedRecords = records.map((record, index) => ({
      ...record,
      files: filePaths.slice(index * 5, (index + 1) * 5)
    }));

    const climbRecords = new ClimbRecords({
      userId,
      date,
      gymId,
      records: updatedRecords
    });
    console.log("Received files: ", files);
    console.log("climbRecords: ", climbRecords);
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
