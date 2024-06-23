const Gyms = require("../models/gyms");
const axios = require("axios");

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

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


const geocodeAddress = async (address) => {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
    );
  
    const data = response.data;
  
    if (data.status === "OK") {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  };
  
  exports.updateGymsWithCoordinates = async (req, res) => {
    try {
      const gyms = await Gyms.find();
  
      for (const gym of gyms) {
        const { address } = gym;
        const { lat, lng } = await geocodeAddress(address);
  
        gym.latitude = lat;
        gym.longitude = lng;
        await gym.save();
      }
  
      res.status(200).json({ message: "All gyms updated with coordinates" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };