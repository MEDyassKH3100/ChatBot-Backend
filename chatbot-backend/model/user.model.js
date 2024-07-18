const mongoose = require('mongoose');
const db = require('../config/db');

const { Schema, model } = mongoose;

const userSchema = new Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  cin: {
    type: Number,
    unique: true,
    required: true
  },
  identifiant: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  mdp: {
    type: String,
    required: true,
    unique: true
  }
});

const UserModel = db.model('user',userSchema);
module.exports = UserModel;