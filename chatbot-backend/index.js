const express = require('express');
const db = require('./config/db');
const UserModel = require ('./model/user.model')


// create express server
const app = require('./app');
const port = 3000;
app.use(express.json())

// Routes
app.get('/',(req, res) => {
    res.send('Chatbot Backend ESPRIT Created By MED YASSINE KHLAF');
//res.status(200).json({message :"hello from the other side "})
  });

app.listen(port,()=>{
    console.log(`Server Listening on port http://localhost:${port}`);
});

