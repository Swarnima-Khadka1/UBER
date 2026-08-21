require('dotenv').config(); // load environment variables from .env file
const express= require('express');
const app= express();
const cookieParser= require('cookie-parser'); // require the cookie-parser middleware
const riderRoutes= require('./routes/rider.routes.js'); // require the rider routes module
const connectDB= require('./db/db.js'); // require the database connection module
const rabbitmq= require('./service/rabbit.js'); // require the RabbitMQ service module

connectDB(); // connect to the database

app.use(express.json()); // middleware to parse JSON request bodies
app.use(express.urlencoded({extended: true})); // middleware to parse URL-encoded request bodies
app.use(cookieParser()); // use the cookie-parser middleware
app.use('/', riderRoutes); // use the rider routes for any request to the root path
rabbitmq.connectRabbitMQ(); // connect to RabbitMQ

module.exports= app;