const express = require("express");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const router = express.Router();
const { Users }  = require("../models");
const { Locations }  = require("../models");
const bcrypt = require("bcrypt");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { sign } = require("jsonwebtoken");
const Sequelize = require('sequelize');
const cookieParser = require("cookie-parser");
const Op = Sequelize.Op;
router.use(cookieParser())


router.post("/", async (req, res) => {
  const { username, phonenumber, email, password } = req.body;


  try {
    const existingUser = await Users.findOne({ where: { email: email } });
    if (existingUser) {
      return res.json({ err: "Email is already taken" });
    }
    bcrypt.hash(password, 10).then((hash) => {
      Users.create({
        username: username,
        phonenumber: phonenumber,
        email:email,
        password: hash,
      });
      res.json({ msg: "Registered Successfully" });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Internal Server Error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "User Doesn't Exist" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Wrong Email and Password Combination" });
    }

    const secret_key = "TonmetriSecret"
    const accessToken = sign({ user: user.username }, secret_key);
    res.cookie('token', accessToken, { maxAge: 900000, httpOnly: true });

    return res.status(200).json({ id: user.id, username: user.username, accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});





router.get("/auth", validateToken, (req, res) => {
  res.json({msg: 'Welcome to protected Route'});
  
});


router.get("/link", validateToken, (req, res) => {
  res.json({msg: 'Validation token working'});
  
});



router.get("/userinfo", async (req, res) => {

    const user = await Users.findAll({
    attributes: { exclude: ["password"] },
  });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
    
});



router.get("/locations", async (req, res) => {

  const user = await Locations.findAll({});

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  res.json(user);
  
});



router.put("/change-password", validateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  const user =  await Users.findOne({ where: { username: username } });

  bcrypt.compare(oldPassword, user.password).then(async (match) => {
    if (!match) {
      return res.json({ error: "Wrong Password Entered!" });
    }

    bcrypt.hash(newPassword, 10).then((hash) => {
      Users.update(
        { password: hash },
        { where: { email: req.user.email } }
      );
      res.json({success : "Password Changed Successfully"});
    });
  });
});



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




router.post("/forgot-password", async (req, res) => {
  try {
  // Check that the email address provided is in the database
  const email = req.body.email;
  const existingUser = await Users.findOne({ where: { email: email } });
  if (!existingUser) {
  // If the email address is not in the database, return an error message
  return res.json({ err: 'The email address is not registered' });
  } else {
  // If the email address is in the database, generate a password reset token
  res.json({ msg: 'A password reset link has been sent to your email. Please check your inbox.' });
  const token = crypto.randomBytes(20).toString('hex');
  const expire = Date.now() + 3600000; // 1 hour
  await Users.update({
  reset_password_token: token,
  reset_password_expires: expire
  }, {
  where: { email: email }
  });
  


      // Send a password reset email to the user
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: 'beoptimistic801@gmail.com',
              pass: 'qhscoaicxotgltpc'
          }
      });
      const mailOptions = {
          from: 'beoptimistic801@gmail.com',
          to: email,
          subject: 'Password reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://localhost:3000/forgot/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, (err, response) => {
          if (err) {
              console.error('there was an error: ', err);
          } else {
              console.log('here is the res: ', response);
              res.status(200).json('recovery email sent');
          }
      });
  }
  } catch (err) {
  console.log(err);
  return res.status(500).json({ msg: "Internal Server Error" });
  }
  });




  router.post('/reset/:token', async (req, res) => {
    try {
        // Check that the provided token is valid
        const token = req.params.token;
        const user = await Users.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: { [Op.gt]: Date.now() },
            },
        });
        if (!user) {
            // If the token is invalid or has expired, return an error message
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
        }

        // If the token is valid, update the user's password
        const password = req.body.password;
        const hashedPassword = bcrypt.hashSync(password, 10);
        await user.update({ password: hashedPassword });

        // Send a password reset confirmation email to the user
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'beoptimistic801@gmail.com',
                pass: 'qhscoaicxotgltpc'
            }
        });

        const mailOptions = {
            from: 'beoptimistic801@gmail.com',
            to: user.email,
            subject: 'Password reset successful',
            text: 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ msg: 'password reset successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});





module.exports = router;