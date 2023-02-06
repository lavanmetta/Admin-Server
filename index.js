const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./models");
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))

// Routers

const PasswordRouter = require("./routes/Password");
const AuthRouter = require("./routes/Auth");
const UserInfoRouter = require("./routes/UserInfo");
const LocationsRouter = require("./routes/Locations");

app.use("/auth", AuthRouter);
app.use("/auth", PasswordRouter);
app.use("/auth", UserInfoRouter);
app.use("/auth", LocationsRouter);


db.sequelize.sync().then(() => {
  app.listen(3001, () => {
    console.log("Server running on port 3001");
  });
});

