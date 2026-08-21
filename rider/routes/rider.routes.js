const express= require('express');
const router= express.Router();
const riderController= require('../controllers/rider.controller.js');
const { riderAuth } = require('../middlewares/auth.middleware.js');

router.post('/register', riderController.register);    
router.post('/login', riderController.login);
router.get('/logout', riderController.logout);
router.get('/profile', riderAuth, riderController.profile);
router.patch('/toggle-availability', riderAuth, riderController.toggleAvailability);
router.get('/available-rides', riderAuth, riderController.getAvailableRides);


module.exports= router;