const jwt= require('jsonwebtoken');
const riderModel= require('../models/rider.model');
const BlacklistToken= require('../models/blacklisttoken.models');

module.exports.riderAuth = async (req, res, next) =>{
    try{
        const token = req.cookies.token|| req.headers.authorization?.split(' ')[1]; // Get token from cookie or Authorization header
        if(!token){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const isBlacklisted = await BlacklistToken.findOne({token});
        if(isBlacklisted){
            return res.status(401).json({message: 'Unauthorized'});
        }
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        const rider= await riderModel.findById(decoded.id)

        if(!rider){
            return res.status(401).json({message: 'Unauthorized'});
        }
        req.rider= rider;
        next();
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}