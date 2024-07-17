const mongoose = require('mongoose');
const db = require('../config/db');

const{ Schema,model }=mongoose;
const userSchema = new Schema ({
    nom: {
        type: String,
        required: true
      },
      prenom: {
        type: String,
        required: true
      },

    cin:{
        type: Number,
        unique:true,
        require:true

    },

    identifiant:{
        type:String,
        unique:true,
        require:true

    },

    email:{
        type:String,
        lowercase:true,
        unique:true,
        require:true

    },

    mdp:{
        type:String,
        unique:true,
        require:true

    }

    
})

const UserModel = db.model('user',userSchema);
model.exports = UserModel;