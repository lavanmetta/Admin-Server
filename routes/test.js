const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/AuthMiddleware");
const { isAdmin } = require('../middlewares/CheckRole')


router.get("/test", isAdmin, (req, res) => {
    res.json({msg: 'auth middleware working'});
    
  });




  
module.exports = router;