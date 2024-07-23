const Footprints = require("../models/footprints");
const axios = require("axios");

exports.createOrUpdateFootprint = async (req, res, next) => {
    const { gymId, userId, expiryDate } = req.body;
    
    try {
      const footprint = await Footprints.findOneAndUpdate(
        { userId, gymId },
        { expiryDate },
        { new: true, upsert: true}
      );

      res.status(200).json(footprint);
    } catch (error) {
      next(error);
    }
};

exports.getFootprintByUserId = async (req, res, next) => {
    const userId = req.params.userId;
    try {
      const footprints = await Footprints.find({ userId }).populate("gymId");
      res.status(200).send(footprints);
    } catch (error) {
      next(error);
    }
};

exports.getMapsApiUrl = async (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  res.json({ url });
};

exports.getGeocode = async (req, res, next) => {
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
    next(error);
  }
};

exports.getPlaces = async (req, res, next) => {
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
    next(error);
  }
};