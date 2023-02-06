const express = require("express");
const { Users }  = require("../models");
const router = express.Router();
const { Locations }  = require("../models");

const { validateToken } = require("../middlewares/AuthMiddleware");


// adding locations data

router.post("/locations", async (req, res) => {
    const { name, address, phone_number, longitude, latitude,  radius_proximity , photos_videos, parent_location, description } = req.body;
    
    if (!name || !address || !phone_number || !longitude || !latitude || !radius_proximity) {
      return res.status(400).json({ error: "Name, address, phone_number, longitude, latitude and radius_proximity are required fields" });
    }
  
  
    if (typeof longitude !== "number" || typeof latitude !== "number") {
      return res.status(400).json({ error: "Longitude and latitude must be numbers" });
    }
  
    if (name.length > 100 || address.length > 200) {
      return res.status(400).json({ error: "Name must be less than 100 characters, address must be less than 200 characters" });
    }
  
  
    // Create a new location if all validations pass
    Locations.create({
      name,
      address,
      phone_number,
      longitude,
      latitude,
      radius_proximity,
      photos_videos,
      parent_location,
      description
    });
  
    res.json({ msg: "New location added successfully" });
  });





//   getting all locations data

  router.get("/locations", async (req, res) => {

    const user = await Locations.findAll({});
  
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
  
    res.json(user);
    
  });



  module.exports = router;