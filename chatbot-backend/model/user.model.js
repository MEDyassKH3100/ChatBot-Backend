const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const db = require("../config/db");

const { Schema } = mongoose;

const userSchema = new Schema({
  nom: {
    type: String,
    required: [true, "Le nom est requis."],
    maxlength: [20, "Le nom ne peut pas dépasser 20 caractères."],
    match: [/^[A-Za-z]+$/, "Le nom doit être alphabétique."],
  },
  prenom: {
    type: String,
    required: [true, "Le prénom est requis."],
    maxlength: [20, "Le prénom ne peut pas dépasser 20 caractères."],
    match: [
      /^[A-Za-z\s]+$/,
      "Le prénom doit être alphabétique et peut contenir des espaces.",
    ],
  },
  cin: {
    type: Number,
    unique: true,
    required: function() {
      return this.role === 'user';  // Ce champ est requis seulement si le rôle est 'user'
    },
    validate: {
      validator: function (v) {
        return /^\d{8}$/.test(v);
      },
      message: (props) => `${props.value} n'est pas un numéro CIN valide!`,
    },
  },
  identifiant: {
    type: String,
    unique: true,
    required: function() {
      return this.role === 'user';  // Ce champ est requis seulement si le rôle est 'user'
    },
    minlength: [10, "L'identifiant doit comporter 10 caractères."],
    maxlength: [10, "L'identifiant doit comporter 10 caractères."],
    match: [
      /^[A-Za-z0-9]+$/,
      "L'identifiant doit être alphanumérique et sans symbole.",
    ],
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "L'email est requis."],
    match: [
      /^[A-Za-z]+\.[A-Za-z]+@esprit\.tn$/,
      "L'email doit être sous la forme prenom.nom@esprit.tn.",
    ],
  },
  mdp: {
    type: String,
    required: [true, "Le mot de passe est requis."],
    unique: true,
    validate: {
      validator: function (v) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/.test(v);
      },
      message: (props) =>
        "Le mot de passe doit être fort (au moins 8 caractères, incluant une majuscule, une minuscule, un chiffre et un symbole).",
    },
  },
  paymentReceipt: {
    type: String,
    unique: true,
    required: function() {
      return this.role === 'user';  // Ce champ est requis seulement si le rôle est 'user'
    },
    validate: {
      validator: function (v) {
        return /^[A-Z0-9]{12}$/.test(v); // Vérifie que le reçu est de 12 caractères alphanumériques majuscules
      },
      message: (props) =>
        `${props.value} n'est pas un reçu valide. Le reçu doit contenir exactement 12 caractères composés de chiffres et de lettres majuscules.`,
    },
  },
  role: {
    type: String,
    enum: ["user", "admin"], // Le rôle peut être 'user' ou 'admin'
    default: "user", // Par défaut, le rôle est 'user'
  },
  jwtToken: { type: String },
  isBanned: {
    type: Boolean,
    default: false,  // Par défaut, l'utilisateur n'est pas banni
},
  otp: Number, // Ajoutez ce champ pour l'OTP
  otpExpire: Date, // Ajoutez ce champ pour l'expiration de l'OTP
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("mdp")) {
    return next(); // Ne pas hacher si le mot de passe n'est pas modifié
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.mdp = await bcrypt.hash(this.mdp, salt); // Hacher le mot de passe avant de l'enregistrer
    next();
  } catch (error) {
    next(error);
  }
});

/*userSchema.pre("save", async function (next) {
  if (!this.isModified("mdp")) {
    next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.mdp = await bcrypt.hash(this.mdp, salt); // Hacher le mot de passe avant de l'enregistrer
    next();
  } catch (error) {
    next(error);
  }
});*/

const UserModel = db.model("user", userSchema);
module.exports = UserModel;
module.exports = mongoose.model("User", userSchema);
