const Footprints = require("../models/footprints");
const axios = require("axios");

exports.createOrUpdateFootprint = async (req, res) => {
    const { gymId, userId, lastVisit, visitTimes, expiryDate } = req.body;
    
    try {
      const footprint = await Footprints.findOneAndUpdate(
        { userId, gymId },
        { lastVisit, visitTimes, expiryDate },
        { new: true, upsert: true}
      );

      res.status(200).json(footprint);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

exports.getFootprintByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
      const footprints = await Footprints.find({ userId }).populate("gymId");
      res.status(200).send(footprints);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
};

exports.getMapsApiUrl = async (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  res.json({ url });
};

exports.getGeocode = async (req, res) => {
  try {
    const address = req.query.address;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address: address,
        key: apiKey
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching geocode:', error);
    res.status(500).json({ error: 'Error fetching geocode' });
  }
};

exports.getPlaces = async (req, res) => {
  try {
    const { lat, lng, query } = req.query;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json`, {
      params: {
        location: `${lat},${lng}`,
        radius: '50',
        query: query,
        key: apiKey
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Error fetching places' });
  }
};