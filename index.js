const express = require("express");
var cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const db = require("./models");
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())


// Routers

const usersRouter = require("./routes/Users");
app.use("/auth", usersRouter);








db.sequelize.sync().then(() => {
  app.listen(3001, () => {
    console.log("Server running on port 3001");
  });
});

