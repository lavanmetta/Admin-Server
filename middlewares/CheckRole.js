
const { Users }  = require("../models");


const isUser = async (req, res, next) => {

    const email = req.body.email;
    console.log(email)

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.json({ msg: "user not found" });
    }
    if (user.role === 'superadmin') {
        next()
    }
     if (user.role === 'admin') {
        next()
        
    }
    else if (user.role === 'moderator') {
        res.json({ msg: "not admin" });
   }
    

};
  


module.exports = { isUser };
