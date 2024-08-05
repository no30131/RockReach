const Gyms = require("../models/gyms");
// const axios = require("axios");

// const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

exports.createGyms = async (req, res, next) => {
    const { name, phone, address } = req.body;
    try {
        const gyms = new Gyms({ name, phone, address });
        await gyms.save();
        res.status(201).json(gyms);
    } catch (error) {
        next(error);
    }
};

exports.getAllGyms = async (req, res, next) => {
    try {
        const gyms = await Gyms.find();
        res.status(200).json(gyms);
    } catch (error) {
        next(error);
    }
};

exports.getGymsById = async (req, res, next) => {
    const gymsId = req.params.id;
    try {
        const gyms = await Gyms.findById(gymsId);
        if (!gyms) {
            return res.status(404).json({ error: "Gym not found" });
        }
        res.status(200).json(gyms);
    } catch (error) {
        next(error);
    }
};