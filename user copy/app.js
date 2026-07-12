require('dotenv').config(); // load environment variables from .env file
const express= require('express');
const app= express();
const cookieParser= require('cookie-parser'); // require the cookie-parser middleware
const userRoutes= require('./routes/user.routes.js'); // require the user routes module
const connectDB= require('./db/db.js'); // require the database connection module


connectDB(); // connect to the database

app.use(express.json()); // middleware to parse JSON request bodies
app.use(express.urlencoded({extended: true})); // middleware to parse URL-encoded request bodies
app.use(cookieParser()); // use the cookie-parser middleware
app.use('/', userRoutes); // use the user routes for any request to the root path

module.exports= app;