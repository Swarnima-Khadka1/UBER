const riderModel= require('../models/rider.model');
const bcrypt= require('bcrypt');
const jwt = require('jsonwebtoken');
const BlacklistToken = require('../models/blacklisttoken.models');
const { subscribeToQueue }= require('../service/rabbit.js');

// Store waiting rider responses for long polling
let waitingRiders = [];

module.exports.register = async (req, res) => {
    try{
        const {name, email, password} = req.body;
        const rider = await riderModel.findOne({email});

        if(rider){
            return res.status(400).json({message: 'rider already exists'});
        }
        const hashedPass= await bcrypt.hash(password, 10); // hash the password with a salt of 10 rounds
        //create a new rider
        const newrider = new riderModel({
            name,
            email,
            password: hashedPass
        });

        await newrider.save(); // save the new rider to the database  
        //create a token for the new rider
        const token = jwt.sign({id: newrider._id}, process.env.JWT_SECRET, {expiresIn: '7d'}); // secret key for signing the token, expires in 7 days

        res.cookie('token', token);
        delete newrider._doc.password; // remove the password from the rider object before sending it in the response
        res.send({message: 'rider created successfully', rider: newrider, token});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }

}

module.exports.login = async(req, res) =>{
    try{
        const {email, password} = req.body;
        const rider = await riderModel.findOne({email});
        if(!rider){
            return res.status(400).json({message: 'rider does not exist'});
        }
        const isMatch = await bcrypt.compare(password, rider.password);
        if(!isMatch){
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const token = jwt.sign({id: rider._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
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
        const rider = req.rider;
        res.send({rider});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}

module.exports.getAvailableRides = async(req, res) =>{
    try{
        console.log('Rider waiting for available rides:', req.rider._id);
        
        // Add this response to waiting riders
        waitingRiders.push(res);
        console.log('Total waiting riders:', waitingRiders.length);
        
        // Timeout after 30 seconds if no ride comes
        const timeout = setTimeout(() => {
            waitingRiders = waitingRiders.filter(r => r !== res);
            if(!res.headersSent){
                console.log('Long polling timeout for rider, sending 204');
                res.status(204).send(); // No content
            }
        }, 30000);
        
        // Handle client disconnect
        res.on('close', () => {
            clearTimeout(timeout);
            waitingRiders = waitingRiders.filter(r => r !== res);
            console.log('Rider disconnected, remaining waiting riders:', waitingRiders.length);
        });
    }
    catch(err){
        console.error('Error in getAvailableRides:', err.message);
        res.status(500).json({message: 'Server error'});
    }
}

module.exports.toggleAvailability = async(req, res) =>{
    try{
        const rider = await riderModel.findById(req.rider._id);
        rider.isAvailable = !rider.isAvailable; 
        await rider.save();
        res.send({rider, message: 'Availability status updated successfully'});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Server error'});
    }
}

subscribeToQueue("new-ride", async (message) => {
    const rideData = JSON.parse(message);
    console.log('Received new ride request:', rideData);
    console.log('Waiting riders count:', waitingRiders.length);
    
    // Send ride to all waiting riders
    waitingRiders.forEach((res, index) => {
        try {
            if (!res.headersSent) {
                console.log(`Sending ride to rider ${index}`);
                res.status(200).json({message: 'New ride available', ride: rideData});
            } else {
                console.log(`Rider ${index} already sent response`);
            }
        } catch (err) {
            console.error(`Error sending ride to rider ${index}:`, err.message);
        }
    });
    
    // Clear waiting riders list after sending
    waitingRiders = [];
});
