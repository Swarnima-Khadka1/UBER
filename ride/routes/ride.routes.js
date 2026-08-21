const express= require('express');
const {userAuth, riderAuth}= require('../middleware/auth.middleware.js');
const rideController= require('../controller/ride.controller.js');
const router= express.Router();

router.post('/request-ride', userAuth, rideController.requestRide);
router.put('/update-ride', riderAuth, rideController.updateRide);

module.exports= router;