const Achievements = require("../models/achievements");

exports.createAchievement = async (req, res, next) => {
  try {
    const { userId, customName, status } = req.body;

    if (status !== "completed") {
      return res.status(400).send({ error: "Status can only be 'completed'" });
    }

    const existingAchievement = await Achievements.findOne({ userId, customName });
    
    if (existingAchievement) {
      if (existingAchievement.status !== "completed") {
        existingAchievement.status = "completed";
        await existingAchievement.save();
      }
      res.status(200).json(existingAchievement);
    } else {
      const newAchievement = new Achievements({ userId, customName, status: "completed" });
      await newAchievement.save();
      res.status(201).json(newAchievement);
    }
  } catch (error) {
    next(error);
  }
};

exports.getAchievementsByUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const achievements = await Achievements.find({ userId }).lean();
    if (!achievements || achievements.length === 0) {
      return res.status(404).json({ error: "Achievements not found" });
    }
    res.status(200).json(achievements);
  } catch (error) {
    next(error);
  }
};