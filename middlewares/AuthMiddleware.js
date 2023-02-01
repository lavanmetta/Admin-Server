const { verify } = require("jsonwebtoken");
const express = require("express");
var cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());

const validateToken = (req, res, next) => {

  const token = req.header.accessToken
  
 // Step 1: Get the token from the cookie

  if (!token) return res.json({ error: "User not logged in!" });
// Step 2: Check if the token exists

  try {
    // Step 3: Verify the token
    const validToken = verify(token, "TonmetriSecret")
    if (validToken) {
      return next();
    }
  } catch (err) {
    return res.json({ error: err });
  }
};




module.exports = { validateToken };
