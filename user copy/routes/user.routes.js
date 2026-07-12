const express= require('express');
const router= express.Router();
const userController= require('../controllers/user.controller.js');
const { userAuth } = require('../middlewares/auth.middleware.js');

router.post('/register', userController.register);    
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/profile', userAuth, userController.profile);

module.exports= router;