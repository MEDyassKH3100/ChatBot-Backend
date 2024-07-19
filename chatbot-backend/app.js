const express = require('express');
const userRouter = require('./routers/user.router');

const app = express();

app.use(express.json());
app.use('/', userRouter); // Utilisez /api comme préfixe pour toutes les routes

module.exports = app;
