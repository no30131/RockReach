const ClimbRecords = require("../models/climbRecords");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.createClimbRecords = async (req, res, next) => {
  try {
    const { userId, date, gymName, records } = req.body;

    let parsedRecords;
    try {
      parsedRecords = typeof records === 'string' ? JSON.parse(records) : records;
    } catch (parseError) {
      return res.status(400).json({ message: "Invalid records JSON", error: parseError.message });
    }

    for (let record of parsedRecords) {
      if (record.wall && record.wall.length > 3) {
        return res.status(400).json({ message: "牆面編號不能超過3個字元！" });
      }
      if (record.memo && record.memo.length > 100) {
        return res.status(400).json({ message: "備註不能超過100個字元！" });
      }
    }

    const files = req.files || [];

    const uploadPromises = files.map(async (file) => {
      const fileName = `climb_records/${file.originalname}`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const data = await s3.upload(params).promise();
      return data.Location;
    });

    const fileUrls = await Promise.all(uploadPromises);

    const updatedRecords = parsedRecords.map((record, index) => ({
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
    res.status(201).json(climbRecords);
  } catch (error) {
    next(error);
  }
};

exports.removeClimbRecord = async (req, res, next) => {
  const recordId = req.params.id;

  try {
    const record = await ClimbRecords.findById(recordId);

    if (!record) {
      return res.status(404).json({ error: "Climb record not found" });
    }

    const deletePromises = record.records.flatMap(subRecord => {
      if (subRecord.files && subRecord.files.length > 0) {
        return subRecord.files.map(async (fileUrl) => {
          const fileName = fileUrl.split('/').pop();
          const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `climb_records/${fileName}`,
          };
          await s3.deleteObject(params).promise();
        });
      }
      return [];
    });

    await Promise.all(deletePromises);

    await ClimbRecords.findByIdAndDelete(recordId);

    res.status(200).json({ message: "Climb record removed successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getClimbRecordsByUserId = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const climbRecords = await ClimbRecords.find({ userId: userId }).lean();
    if (!climbRecords || climbRecords.length === 0) {
      return res.status(404).json({ error: "Climb records not found" });
    }
    const formattedRecords = climbRecords.map((record) => ({
      ...record,
      records: record.records.map((rec) => ({
        ...rec,
        likes: rec.likes || 0,
        comments: rec.comments || [],
        likedBy: rec.likedBy || [],
      })),
    }));
    res.status(200).json(formattedRecords);
  } catch (error) {
    next(error);
  }
};

exports.getExploresRecords = async (req, res, next) => {
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
          likedBy: rec.likedBy || [],
        })),
    }));

    res.status(200).json(formattedRecords);
  } catch (error) {
    next(error);
  }
};


exports.addExploresLike = async (req, res, next) => {
  const { userId } = req.body;
  const subRecordId = req.params.id;

  try {
    const record = await ClimbRecords.findOneAndUpdate(
      { "records._id": subRecordId, "records.likedBy": { $ne: userId } },
      {
        $inc: { "records.$.likes": 1 },
        $push: { "records.$.likedBy": userId }
      },
      { new: true }
    );

    if (!record) {
      return res.status(400).json({ error: "User has already liked this record" });
    }

    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
};

exports.removeExploresLike = async (req, res, next) => {
  const { userId } = req.body;
  const subRecordId = req.params.id;

  try {
    const record = await ClimbRecords.findOneAndUpdate(
      { "records._id": subRecordId, "records.likedBy": userId },
      {
        $inc: { "records.$.likes": -1 },
        $pull: { "records.$.likedBy": userId }
      },
      { new: true }
    );

    if (!record) {
      return res.status(400).json({ error: "User has not liked this record" });
    }

    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
};

exports.addExploresComment = async (req, res, next) => {
  const id = req.params.id;
  const { comment } = req.body;
  try {
    const record = await ClimbRecords.findOneAndUpdate(
      { "records._id": id },
      { $push: { "records.$.comments": comment } },
      { new: true }
    );

    if (comment && comment.length > 100) {
      return res.status(400).json({ message: "留言不能超過100個字元！" });
    }

    // const records = await ClimbRecords.find({
    //   "records.files": { $exists: true, $ne: [] },
    // })
    //   .populate("userId", "name image")
    //   .lean();

    // const formattedRecords = records.map((record) => ({
    //   ...record,
    //   user: record.userId,
    //   records: record.records
    //     .filter((rec) => rec.files && rec.files.length > 0)
    //     .map((rec) => ({
    //       ...rec,
    //       likes: rec.likes || 0,
    //       comments: rec.comments || [],
    //     })),
    // }));

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

exports.getExploresRecordsByUser = async (req, res, next) => {
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

    res.status(200).json(formattedRecords);
  } catch (error) {
    next(error);
  }
};

exports.getExploresRecordsById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const records = await ClimbRecords.findById(id)
      .populate("userId", "name image")
      .lean();

    if (!records) {
      return res.status(404).json({ error: "Records not found" });
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

    res.status(200).json(formattedRecords);
  } catch (error) {
    next(error);
  }
};

exports.getSortedClimbRecords = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const userRecords = await ClimbRecords.find({ userId: userId }).lean();
    const userGyms = new Set(userRecords.map(record => record.gymName));

    const allRecords = await ClimbRecords.find({
      "records.files": { $exists: true, $ne: [] },
    })
      .populate("userId", "name image")
      .lean();

    const userGymRecords = [];
    const otherRecords = [];

    allRecords.forEach(record => {
      if (userGyms.has(record.gymName)) {
        userGymRecords.push(record);
      } else {
        otherRecords.push(record);
      }
    });

    const sortedRecords = [...userGymRecords, ...otherRecords];

    const formattedRecords = sortedRecords.map(record => ({
      ...record,
      user: record.userId,
      records: record.records
        .filter(rec => rec.files && rec.files.length > 0)
        .map(rec => ({
          ...rec,
          likes: rec.likes || 0,
          comments: rec.comments || [],
        })),
    }));

    res.status(200).json(formattedRecords);
  } catch (error) {
    next(error);
  }
};

