const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
    const { name, email, password } = req.body;
    const provider = "native";
    const public = "public"; 
    const introduce = "Let's climb!"; 
    const image = "";

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, provider, public, introduce, image });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, {
            // httpOnly: true,
            // secure: true,
            credentials: true,
            maxAge: 3600000,
        });

        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ error: "Invalid email!" });
        }
        
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).send({ error: "Invalid password!"});
        }

        const token = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, {
            // httpOnly: true,
            // secure: true,
            maxAge: 3600000,
            credentials: true
        });

        res.status(200).send({ user, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
}

exports.getUserById = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId).select("name introduce image");
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};