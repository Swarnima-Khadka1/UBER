const  mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,   
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Token will be removed after 1 hour (3600 seconds)
    }
},{
    timestamps: true
});

const BlacklistToken = mongoose.model('BlacklistToken', blacklistTokenSchema);
module.exports = BlacklistToken;