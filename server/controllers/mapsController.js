const Maps = require("../models/maps");

exports.createMaps = async (req, res) => {
    const { name, email, password } = req.body;
    const provider = "native";
    const public = "public"; 
    const introduce = "Let's climb!"; 
    const image = "";
    try {
        const user = new User({ name, email, password, provider, public, introduce, image });
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.getUserById = async (req, res) => {
    const userId = req.query.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};