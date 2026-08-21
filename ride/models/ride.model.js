const mongoose= require('mongoose');

const rideSchema= new mongoose.Schema({
    riderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rider',
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    pickupLocation:{
        type: String,
        required: true
    },
    dropoffLocation:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ['requested', 'accepted', 'in-progress', 'completed', 'cancelled'],
        default: 'requested'
    }
},
{
    timestamps: true
});

const rideModel= mongoose.model('Ride', rideSchema);

module.exports = rideModel;