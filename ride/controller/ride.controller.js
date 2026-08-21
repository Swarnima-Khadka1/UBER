const rideModel= require('../models/ride.model.js');
const { publishToQueue }= require('../service/rabbit.js');

module.exports.requestRide= async (req, res, next)=>{
    try{
        const {pickupLocation, dropoffLocation}= req.body;
        
        console.log('Request ride - user:', req.user._id);
        console.log('Pickup:', pickupLocation, 'Dropoff:', dropoffLocation);

        const newRide = new rideModel({
            user: req.user._id,
            pickupLocation,
            dropoffLocation,
            status: 'requested'
        })

        await newRide.save();
        console.log('Ride saved:', newRide._id);
        
        // Publish the new ride request to the RabbitMQ queue
        publishToQueue("new-ride", JSON.stringify(newRide));
        console.log('Ride published to RabbitMQ');
        
        res.status(201).json({message: 'Ride requested successfully', ride: newRide});
    }
    catch(err){
        console.error('Error requesting ride:', err.message);
        res.status(500).json({message: 'Server error', error: err.message});
    }
}

module.exports.updateRide= async (req, res, next)=>{
    try{
        const {rideId}= req.query;
        const {status}= req.body || {};
        
        console.log('Update ride - rideId:', rideId, 'status:', status);
        console.log('req.body:', req.body);
        
        if(!rideId || !status){
            return res.status(400).json({message: 'Missing rideId or status'});
        }

        const ride= await rideModel.findById(rideId);
        if(!ride){
            return res.status(404).json({message: 'Ride not found'});
        }

        ride.status= status;
        await ride.save();
        res.status(200).json({message: 'Ride status updated successfully', ride});
    }
    catch(err){
        console.error('Error updating ride:', err.message);
        res.status(500).json({message: 'Server error', error: err.message});
    }
}

