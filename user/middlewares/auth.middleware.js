const jwt= require('jsonwebtoken');
const userModel= require('../models/user.model');

module.exports.userAuth = async (req, res, next) =>{
    try{
        const token = req.cookies.token|| req.headers.authorization?.split(' ')[1]; // Get token from cookie or Authorization header
        if(!token){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        const user= await userModel.findById(decoded.id)

        if(!user){
            return res.status(401).json({message: 'Unauthorized'});
        }
        req.user= user;
        next();
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}