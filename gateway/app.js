const express= require('express');

const expressProxy = require('express-http-proxy');

const app= express();

app.use('/user', expressProxy('http://localhost:3001')); //redirect requests to /user to the user service running on port 3001
app.use('/rider', expressProxy('http://localhost:3002')); //redirect requests to /rider to the rider service running on port 3002
app.use('/ride', expressProxy('http://localhost:3003')); //redirect requests to /ride to the ride service running on port 3003

app.listen(3000, () => {
    console.log('API Gateway running on port 3000');
});

