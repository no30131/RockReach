const express = require("express");
const router = express.Router();
const footprintsController = require("../controllers/footprintsController");

router.post("/create", footprintsController.createOrUpdateFootprint);
router.get("/google-maps-api-url", footprintsController.getMapsApiUrl);
router.get("/google-maps/geocode", footprintsController.getGeocode);
router.get("/google-maps/places", footprintsController.getPlaces);
router.get("/:userId", footprintsController.getFootprintByUserId);

module.exports = router;