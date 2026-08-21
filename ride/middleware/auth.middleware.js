const jwt= require('jsonwebtoken');
const axios = require('axios');


module.exports.userAuth = async (req, res, next) =>{
    try{
        const token = req.cookies.token|| req.headers.authorization?.split(' ')[1]; // Get token from cookie or Authorization header
        if(!token){
            return res.status(401).json({message: 'Unauthorized - no token'});
        }
   
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        console.log('Ride auth - Token decoded, user ID:', decoded.id);
        
        // Try to validate with user service, but fallback to JWT if it fails
        try {
            const response = await axios.get(`${process.env.BASE_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 5000  // 5 second timeout
            });

            // User service returns {user: userData}, so unwrap it
            let user = response.data.user || response.data;
            console.log('User service response:', user ? 'User found' : 'No user in response');
            
            if(user){
                req.user = { ...user, _id: user._id || decoded.id };
                console.log('Ride auth - User authenticated via user service:', req.user._id);
                next();
                return;
            }
        } catch(serviceErr) {
            console.log('User service call failed, using JWT fallback:', serviceErr.message);
        }
        
        // Fallback: Trust the JWT token
        req.user = { _id: decoded.id };
        console.log('Ride auth - User authenticated via JWT fallback:', decoded.id);
        next();
    }
    catch(err){
        console.error('Ride auth error:', err.message);
        res.status(500).json({message: 'Server error', error: err.message});
    }
}

module.exports.riderAuth = async (req, res, next) =>{
    try{
        const token = req.cookies.token|| req.headers.authorization?.split(' ')[1]; // Get token from cookie or Authorization header    
    if(!token){
            return res.status(401).json({message: 'Unauthorized'});
        }

        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        // Make a request to the rider service to check if the rider exists
        const response = await axios.get(`${process.env.BASE_URL}/rider/profile`, { 
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const rider = response.data;
        if(!rider){
            return res.status(401).json({message: 'Unauthorized'});
        }

        // Ensure rider object has _id from either response or decoded JWT
        req.rider = { ...rider, _id: rider._id || decoded.id };
        next();
    }
    catch(err){
        console.error('Auth error:', err.message);
        res.status(500).json({message: 'Server error', error: err.message});
    }
}