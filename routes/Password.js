const express = require("express");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require("bcrypt");
const Sequelize = require('sequelize');
const { Users }  = require("../models");
const { validateToken } = require("../middlewares/AuthMiddleware");
const Op = Sequelize.Op;
const router = express.Router();



// password change after login

router.put("/changepassword", validateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
  
    try {
      const user = await Users.findOne({ where: { username: req.user } });
      const isMatch = await bcrypt.compare(oldPassword, user.password);
  
      if (!isMatch) {
        return res.json({ error: "Wrong Password Entered!" });
      }
  
      const hash = await bcrypt.hash(newPassword, 10);
      const updated = await Users.update(
        { password: hash },
        { where: { username: req.user } }
      );
  
      if (updated[0] === 0) {
        return res.json({ error: "Failed to update password" });
      }
  
      res.json({ success: "Password Changed Successfully" });
    } catch (error) {
      res.json({ error: "Failed to change password" });
    }
  });
  
  






 // forgot password before login

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