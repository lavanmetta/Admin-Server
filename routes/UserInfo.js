const express = require("express");
const { Users }  = require("../models");
const router = express.Router();




// user information

router.get("/userinfo", async (req, res) => {

    const user = await Users.findAll({
    attributes: { exclude: ["password"] },
  });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
    
});

module.exports = router;