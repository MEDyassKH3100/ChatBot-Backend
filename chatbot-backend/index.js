const express = require('express');
const db = require('./config/db');
const UserModel = require ('./model/user.model')
const app = express();
const userRouter = require('./routers/user.router');
const morgan = require('morgan')



app.use(express.json());
// Utilisez /api comme préfixe pour toutes les routes

// create express server
app.use(morgan('dev'))
const port = 3000;



app.use('/user', userRouter); 
app.listen(port,()=>{
    console.log(`Server Listening on port http://localhost:${port}`);
});

