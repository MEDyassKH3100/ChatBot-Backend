const express = require('express');
//const body_parser = require('body-parser');
const userRouter = require('./routers/user.router');

// import express modele
const app = express();

//app.use(body_parser.json());
app.use('/',userRouter);

// export our app 
module.exports = app ;
