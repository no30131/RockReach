const Gyms = require("../models/gyms");

exports.createGyms = async (req, res) => {
    const { name, phone, address } = req.body;
    try {
        const gyms = new Gyms({ name, phone, address });
        await gyms.save();
        res.status(201).send(gyms);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.getAllGyms = async (req, res) => {
    try {
        const gyms = await Gyms.find();
        res.status(200).send(gyms);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

exports.getGymsById = async (req, res) => {
    const gymsId = req.params.id;
    try {
        const gyms = await Gyms.findById(gymsId);
        if (!gyms) {
            return res.status(404).json({ error: "Gym not found" });
        }
        res.status(200).send(gyms);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};