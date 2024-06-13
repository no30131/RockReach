const Friends = require("../models/friends");

exports.createFriends = async (req, res) => {
    const { inviterId, receiverId, friendDate, chat } = req.body;
    try {
        const friends = new Friends({ inviterId, receiverId, friendDate, chat });
        await friends.save();
        res.status(201).send(friends);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.getFriendsById = async (req, res) => {
    const friendsId = req.params.id;
    try {
        const friends = await Friends.findById(friendsId);
        if (!friends) {
            return res.status(404).json({ error: "Friends not found" });
        }
        res.status(200).send(friends);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};