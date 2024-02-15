const jwt = require('jsonwebtoken');
const Instructor = require('../models/Instructor');

const verifyToken = async(req,res,next)=>{
    let user;
    if(req.headers.authorization){
        const token = req.headers.authorization.split(" ")[1];
        try{
            user = jwt.verify(token,process.env.JWT_SECRET);
            let userAuth = await Instructor.findOne({ email: user.email });
            if (!userAuth) {
                return res.status(400).json({ error: 'Instructor not found' });
            }  
        }catch{
            err={
                name:'TokeExprired',
                message: 'Auth token Expired'
            }
            return res.status(400).json(err);
        }
    }
    req.user = user;
    if(!user){
        return res.status(400).json({"error":"no auth token found"});
    }
    next();
}

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
      if (req.user.isAdmin) {
        next();
      } else {
        res.status(403).json("You are not allowed to do that!");
      }
    });
  };


module.exports = {
    verifyToken,
    verifyTokenAndAdmin
}