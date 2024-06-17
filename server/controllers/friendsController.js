const Friends = require("../models/friends");
const moment = require("moment-timezone");

exports.createFriends = async (req, res) => {
  const { inviterId, receiverId, friendDate } = req.body;
  try {
    const dateOnly = new Date(friendDate).toISOString().split("T")[0];
    const friends = new Friends({
      inviterId,
      receiverId,
      friendDate: dateOnly,
      chat: [],
    });

    await friends.save();
    res.status(201).send(friends);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.getFriendsByUserId = async (req, res) => {
  const userId = req.params.userId;
  try {
    const friends = await Friends.find({
      $or: [{ inviterId: userId }, { receiverId: userId }],
    })
      .populate("inviterId", "name image")
      .populate("receiverId", "name image");

    if (!friends) {
      return res.status(404).json({ error: "Friends not found" });
    }
    res.status(200).send(friends);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const saveChatMessage = async (userId, friendId, message) => {
  try {
    const friend = await Friends.findOne({
      $or: [
        { inviterId: userId, receiverId: friendId },
        { inviterId: friendId, receiverId: userId }
      ]
    });

    if (!friend) {
      throw new Error("Friend not found");
    }

    const newChat = {
      talker: userId,
      message,
      time: moment().tz("Asia/Taipei").format()
    };

    friend.chat.push(newChat);
    await friend.save();
    return newChat;
  } catch (error) {
    throw error;
  }
};

exports.addChatMessage = async (req, res) => {
  const { userId, friendId, message } = req.body;
  try {
    const newChat = await saveChatMessage(userId, friendId, message);
    res.status(201).send(newChat);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

exports.getChatByFriendId = async (req, res) => {
  const friendId = req.params.friendId;
  try {
    const friend = await Friends.findById(friendId);
    if (!friend) {
      return res.status(404).json({ error: "Friend not found" });
    }
    res.status(200).send(friend.chat);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports.saveChatMessage = saveChatMessage;