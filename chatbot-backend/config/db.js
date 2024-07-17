const mongoose = require('mongoose');
// import mongoose library

const connection = mongoose.createConnection('mongodb://localhost:27017/User').on('open',()=>{
    console.log("MongoDB Connected");
}).on('error',()=>{
    console.log("MongoDB connection Error");
});



// create DB connectivity

module.exports = connection ;
