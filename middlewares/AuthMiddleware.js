const jwt = require("jsonwebtoken");
const express = require("express");

const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());


const secret_key = process.env.JWT_SECRET;

const validateToken = (req, res, next) => {
  
 const accessToken =  req.headers.authorization
  console.log(accessToken)
  if (!accessToken) {
    return res.status(401).json({ error: "Access Denied, No Token Provided" });
  }

  try {
    const decoded = jwt.verify(accessToken, secret_key);
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid Token" });
  }
};



module.exports = { validateToken };
