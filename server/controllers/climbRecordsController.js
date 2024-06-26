const ClimbRecords = require("../models/climbRecords");
const AWS = require("aws-sdk");
const path = require("path");
const fs = require("fs");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.createClimbRecords = async (req, res) => {
  try {
    const { userId, date, gymName } = req.body;
    const records = JSON.parse(req.body.records);
    const files = req.files;

    // if (!files || files.length === 0) {
    //   return res.status(400).json({ message: "No files uploaded" });
    // }

    const uploadPromises = files.map(async (file) => {
      const fileContent = fs.readFileSync(file.path);
      const fileName = `climb_records/${path.basename(file.path)}`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: fileContent,
        ContentType: file.mimetype,
      };

      const data = await s3.upload(params).promise();
      // fs.unlinkSync(file.path);
      return data.Location;
    });

    const fileUrls = await Promise.all(uploadPromises);

    const updatedRecords = records.map((record, index) => ({
      ...record,
      files: fileUrls.slice(index * 5, (index + 1) * 5),
    }));

    const dateOnly = new Date(date).toISOString().split("T")[0];

    const climbRecords = new ClimbRecords({
      userId,
      date: dateOnly,
      gymName,
      records: updatedRecords,
    });

    await climbRecords.save();
    res.status(201).send(climbRecords);
  } catch (error) {
    console.error("Error uploading to S3 or saving to DB:", error);
    res.status(500).json({
      message: "Error creating climb records",
      error: error.message,
    });
  }
};

exports.getClimbRecordsByUserId = async (req, res) => {
  const userId = req.params.userId;
  try {
    const climbRecords = await ClimbRecords.find({ userId: userId }).lean();
    if (!climbRecords || climbRecords.length === 0) {
      return res.status(404).json({ error: "Climb records not found" });
    }
    res.status(200).send(climbRecords);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.getExploresRecords = async (req, res) => {
  try {
    const records = await ClimbRecords.find({
      "records.files": { $exists: true, $ne: [] },
    })
      .populate("userId", "name image")
      .lean();
    const formattedRecords = records.map((record) => ({
      ...record,
      user: record.userId,
      records: record.records
        .filter((rec) => rec.files && rec.files.length > 0)
        .map((rec) => ({
          ...rec,
          likes: rec.likes || 0,
          comments: rec.comments || [],
        })),
    }));

    res.status(200).send(formattedRecords);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.addExploresLike = async (req, res) => {
  const id = req.params.id;
  try {
    await ClimbRecords.findOneAndUpdate(
      { "records._id": id },
      { $inc: { "records.$.likes": 1 } },
      { new: true }
    );

    const records = await ClimbRecords.find({
      "records.files": { $exists: true, $ne: [] },
    })
      .populate("userId", "name image")
      .lean();

    const formattedRecords = records.map((record) => ({
      ...record,
      user: record.userId,
      records: record.records
        .filter((rec) => rec.files && rec.files.length > 0)
        .map((rec) => ({
          ...rec,
          likes: rec.likes || 0,
          comments: rec.comments || [],
        })),
    }));

    res.status(201).send(formattedRecords);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.addExploresComment = async (req, res) => {
  const id = req.params.id;
  const { comment } = req.body;
  try {
    const record = await ClimbRecords.findOneAndUpdate(
      { "records._id": id },
      { $push: { "records.$.comments": comment } },
      { new: true }
    );

    const records = await ClimbRecords.find({
      "records.files": { $exists: true, $ne: [] },
    })
      .populate("userId", "name image")
      .lean();

    const formattedRecords = records.map((record) => ({
      ...record,
      user: record.userId,
      records: record.records
        .filter((rec) => rec.files && rec.files.length > 0)
        .map((rec) => ({
          ...rec,
          likes: rec.likes || 0,
          comments: rec.comments || [],
        })),
    }));

    res.status(201).send(formattedRecords);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.getExploresRecordsByUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const records = await ClimbRecords.find({
      userId: userId,
      "records.files": { $exists: true, $ne: [] },
    })
      .populate("userId", "name image")
      .lean();
      
    const formattedRecords = records.map((record) => ({
      ...record,
      user: record.userId,
      records: record.records
        .filter((rec) => rec.files && rec.files.length > 0)
        .map((rec) => ({
          ...rec,
          likes: rec.likes || 0,
          comments: rec.comments || [],
        })),
    }));

    res.status(200).send(formattedRecords);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.getExploresRecordsById = async (req, res) => {
  const id = req.params.id;
  // console.log(id);
  try {
    const records = await ClimbRecords.findById(id)
      .populate("userId", "name image")
      .lean();
    // console.log(records);

    if (!records) {
      return res.status(404).send({ error: "Records not found" });
    }

    const formattedRecords = {
      ...records,
      user: records.userId,
      records: records.records
        .filter((rec) => rec.files && rec.files.length > 0)
        .map((rec) => ({
          ...rec,
          likes: rec.likes || 0,
          comments: rec.comments || [],
        })),
    };

    res.status(200).send(formattedRecords);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};