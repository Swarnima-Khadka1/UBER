const jwt= require('jsonwebtoken');
const userModel= require('../models/user.model');
const BlacklistToken= require('../models/blacklisttoken.models');

module.exports.userAuth = async (req, res, next) =>{
    try{
        const token = req.cookies.token|| req.headers.authorization?.split(' ')[1]; // Get token from cookie or Authorization header
        if(!token){
            return res.status(401).json({message: 'Unauthorized - no token provided', hint: 'Send token in Authorization header as "Bearer <token>" or in cookies'});
        }
        const isBlacklisted = await BlacklistToken.findOne({token});
        if(isBlacklisted){
            return res.status(401).json({message: 'Unauthorized - token blacklisted'});
        }
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully, user ID:', decoded.id);
        
        const user= await userModel.findById(decoded.id)
        console.log('User lookup result:', user ? 'Found' : 'NOT FOUND');

        if(!user){
            return res.status(401).json({message: 'Unauthorized - user not found in database', userId: decoded.id});
        }
        req.user= user;
        console.log('User authenticated successfully:', user.email);
        next();
    }
    catch(err){
        console.error('User auth error:', err.message);
        res.status(500).json({message: 'Server error', error: err.message});
    }
}