const express = require("express");
const jwt =  require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Users }  = require("../models");
const router = express.Router();
require('dotenv').config();
const {isUser} = require('../middlewares/CheckRole')



// registrations code
router.post("/", async (req, res) => {
  
  const { username, phonenumber, email, password } = req.body;
  try {
     //  check if email is already registered or not
    const existingUser = await Users.findOne({ where: { email: email } });
    if (existingUser) {
      return res.json({ err: "Email is already taken" });
    }
    // if new email then hash the password
    bcrypt.hash(password, 10).then((hash) => {
  // create new user
      Users.create({
        username: username,
        phonenumber: phonenumber,
        email:email,
        password: hash,
      });

      res.json({ msg: "Registered Successfully" });

    });
  } catch (err) {
    // or sending error message
    return res.status(500).json({ err: "Internal Server Error" });
  }
});



// Login user code
router.post("/login", async (req, res) => {
  try {
    // check email present in database
    const { email, password } = req.body;
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      // if not return message
      return res.status(401).json({ error: "User Doesn't Exist" });
    }
     // if user exits then compare hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      // if password not matched send message
      return res.status(401).json({ error: "Wrong Email and Password Combination" });
    }

     //use jwt for token generation
    const secret_key = process.env.JWT_SECRET
    const token = jwt.sign({ 
        username: user.username,
        role : user.role
      }, secret_key);

    res.cookie('token', token, { maxAge: 900000, httpOnly: true });
    // sending few info for doing some actions in client side
    return res.status(200).json({ id: user.id, role: user.role,  username: user.username, token });

  } catch (error) {
    // sending error
    return res.status(500).json({ error: "Internal Server Error" });
  }
});





module.exports = router;