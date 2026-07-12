const mongoose= require('mongoose');

const riderSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true  
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    isAvailable:{
        type: Boolean,
        default: true
    }
})

const riderModel= mongoose.model('Rider', riderSchema);

module.exports = riderModel;