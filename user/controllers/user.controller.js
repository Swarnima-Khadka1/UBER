const userModel= require('../models/user.model');
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');
const BlacklistToken = require('../models/blacklisttoken.models');
const { subscribeToQueue } = require('../service/rabbit');
const EventEmitter = require('events');
const rideEventEmitter = new EventEmitter();

module.exports.register = async (req, res) => {
    try{
        const {name, email, password} = req.body;
        const user = await userModel.findOne({email});

        if(user){
            return res.status(400).json({message: 'User already exists'});
        }
        const hashedPass= await bcrypt.hash(password, 10); // hash the password with a salt of 10 rounds
        //create a new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPass,
        
        });

        await newUser.save(); // save the new user to the database  
        //create a token for the new user
        const token = jwt.sign({id: newUser._id}, process.env.JWT_SECRET, {expiresIn: '7d'}); // secret key for signing the token, expires in 7 days

        res.cookie('token', token);
        delete newUser._doc.password; // remove the password from the user object before sending it in the response
        res.send({message: 'User created successfully', user: newUser, token});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }

}

module.exports.login = async(req, res) =>{
    try{
        const {email, password} = req.body;
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({message: 'User does not exist'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.cookie('token', token);
        res.send({message: 'Login successful'});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}

module.exports.logout = async(req, res) =>{
    try{
        const token = req.cookies.token;
        if(!token){
            return res.status(400).json({message: 'No token found'});
        }
        // Add the token to the blacklist
        const blacklistedToken = new BlacklistToken({token});
        await blacklistedToken.save();
        res.clearCookie('token');
        res.send({message: 'Logout successful'});
    }   

    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }   

}

module.exports.profile = async(req, res) =>{
    try{
        const user = req.user;
        res.send({user});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}

module.exports.getRideStatus = async(req, res) =>{
    //long polling implementation to get ride status updates
    console.log('getRideStatus called for user:', req.user._id);
    
    let responseSent = false;
    
    const timeout = setTimeout(() => {
        if(!responseSent && !res.headersSent){
            responseSent = true;
            console.log('Ride status timeout for user:', req.user._id);
            res.status(408).json({message: 'Request timeout - no ride status update received'});
        }
    }, 30000);
    
    rideEventEmitter.once('rideStatusUpdate', (data) => {
        if(!responseSent && !res.headersSent){
            responseSent = true;
            clearTimeout(timeout);
            console.log('Sending ride status to user:', req.user._id, 'Data:', data);
            res.send({rideStatus: data});
        }
    });
}

subscribeToQueue('ride_status_queue', async (rideStatus) => {
   const data= JSON.parse(rideStatus);
   rideEventEmitter.emit('rideStatusUpdate', data);
    console.log('Received ride status update:', data);
});
