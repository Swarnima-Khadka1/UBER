require('dotenv').config();
const express= require('express');
const router= express.Router();
const cookieParser= require('cookie-parser');
const connectDB= require('./db/db.js'); // require the database connection module
const rideRoutes= require('./routes/ride.routes.js');
const rabbitmq= require('./service/rabbit.js');

const app= express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/', rideRoutes); // use the ride routes for any request to the root path
connectDB(); // call the database connection function
rabbitmq.connectRabbitMQ(); // call the RabbitMQ connection function

module.exports= app;