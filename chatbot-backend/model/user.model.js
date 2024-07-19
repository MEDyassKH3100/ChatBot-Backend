const mongoose = require('mongoose');

const bcrypt = require ('bcrypt');

const db = require('../config/db');

const { Schema, model } = mongoose;

const userSchema = new Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis.'],
    maxlength: [20, 'Le nom ne peut pas dépasser 20 caractères.'],
    match: [/^[A-Za-z]+$/, 'Le nom doit être alphabétique.']
  },
  prenom: {
    type: String,
    required: true,
    maxlength: 20,
    match: [/^[A-Za-z]+$/, 'Le prénom doit être alphabétique.']
  },
  cin: {
    type: Number,
    unique: true,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{8}$/.test(v);
      },
      message: props => `${props.value} n'est pas un numéro CIN valide!`
    }
  },
  identifiant: {
    type: String,
    unique: true,
    required: true,
    minlength: 10,
    maxlength: 10,
    match: [/^[A-Za-z0-9]+$/, 'L\'identifiant doit être alphanumérique et sans symbole.']
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true,
    match: [/^[A-Za-z]+\.[A-Za-z]+@esprit\.tn$/, 'L\'email doit être sous la forme prenom.nom@esprit.tn.']
  },
  mdp: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/.test(v);
      },
      message: props => `Le mot de passe doit être fort (au moins 8 caractères, incluant une majuscule, une minuscule, un chiffre et un symbole).`
    }
  }
});

userSchema.pre('save',async function(next){
  try {
    var user = this ;
    const salt = await (bcrypt.genSalt(10));
    const hashpass = await bcrypt.hash(user.mdp,salt);
   
    user.mdp = hashpass ;
    next();

  } catch (error){
    throw error;
  }
});



const UserModel = db.model('user',userSchema);
module.exports = UserModel;