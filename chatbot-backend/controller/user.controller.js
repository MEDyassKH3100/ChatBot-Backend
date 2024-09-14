const UserModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Fonction pour générer un OTP aléatoire
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // Génère un OTP à 6 chiffres
}

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "chatesprit3@gmail.com",
    pass: "vdhu sqjt wuid vjkr",
  },
});

exports.register = async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "L'utilisateur existe déjà" });
    }

    // Créer un nouvel utilisateur
    const newUser = new UserModel(req.body);

    // Générer un token de vérification unique et définir la date d'expiration
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // Le token expire dans 24 heures

    // Stocker le token dans l'utilisateur
    newUser.verificationToken = verificationToken;
    newUser.verificationExpire = verificationExpire;

    // Sauvegarder l'utilisateur
    await newUser.save();

    // Créer l'URL de vérification que vous allez envoyer à l'utilisateur
    const verificationUrl = `http://localhost:3000/user/verifyemail/${verificationToken}`;

    // Créer la template HTML avec le bouton de vérification
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vérification de l'e-mail</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            background-color: #ffffff;
            margin: 50px auto;
            padding: 20px;
            border-radius: 10px;
            max-width: 600px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
          }
          .header h1 {
            color: #5c5aa7;
          }
          .content {
            margin-top: 20px;
            text-align: center;
          }
          .btn {
            background-color: #5c5aa7;
            color: white;
            padding: 15px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin-top: 20px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #888888;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Vérifiez votre adresse e-mail</h1>
          </div>
          <div class="content">
            <p>Bonjour,</p>
            <p>Merci de vous être inscrit. Pour compléter votre inscription, veuillez vérifier votre adresse e-mail en cliquant sur le bouton ci-dessous.</p>
            <a href="${verificationUrl}" class="btn">Vérifier mon adresse e-mail</a>
          </div>
          <div class="footer">
            <p>Si vous n'avez pas créé de compte, veuillez ignorer cet e-mail.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoyer l'e-mail avec la template HTML
    await transporter.sendMail({
      to: newUser.email,
      subject: "Vérification de l'adresse e-mail",
      html: htmlTemplate, // Utilisation de la template HTML
    });

    res.status(200).json({
      message:
        "Inscription réussie. Veuillez vérifier votre e-mail pour valider votre compte.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const verificationToken = req.params.token;

  try {
    const user = await UserModel.findOne({
      verificationToken,
      verificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Le jeton est invalide ou a expiré" });
    }

    // Marquer l'utilisateur comme vérifié
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    user.isVerified = true;

    await user.save();

    res.status(200).json({ message: "E-mail vérifié avec succès" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAll = (req, res) => {
  UserModel.find()
    .then((users) => res.status(200).json(users))
    .catch((err) => res.status(400).json(err));
};

// Fonction de login
exports.login = async (req, res) => {
  const { email, mdp } = req.body;

  try {
    // Rechercher l'utilisateur par email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    // Comparer le mot de passe fourni avec le mot de passe haché
    const isMatch = await bcrypt.compare(mdp, user.mdp);

    // Ajouter des logs pour voir le mot de passe fourni et celui haché dans la base
    console.log("Mot de passe fourni :", mdp);
    console.log("Mot de passe haché stocké :", user.mdp);

    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Générer un token JWT pour authentifier l'utilisateur
    const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Route pour demander la réinitialisation du mot de passe
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    // Générer l'OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Générer un OTP à 6 chiffres

    // Enregistrer l'OTP dans l'utilisateur avec une date d'expiration
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // L'OTP expire dans 10 minutes
    await user.save();

    // Envoyer l'OTP par e-mail
    const htmlTemplate = `
      <h1>Réinitialisation de mot de passe - OTP</h1>
      <p>Votre OTP est : <strong>${otp}</strong></p>
      <p>Il expirera dans 10 minutes.</p>
    `;

    await transporter.sendMail({
      to: user.email,
      subject: "Réinitialisation de mot de passe - OTP",
      html: htmlTemplate,
    });

    res.status(200).json({
      message: "Un email avec l'OTP a été envoyé.",
    });
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la génération de l'OTP." });
  }
};

// Route pour vérifier l'OTP et réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  const { otp, mdp } = req.body;

  try {
    // Rechercher l'utilisateur en fonction de l'OTP et vérifier l'expiration
    const user = await UserModel.findOne({
      otp,
      otpExpire: { $gt: Date.now() }, // Assurer que l'OTP n'est pas expiré
    });

    if (!user) {
      return res.status(400).json({ message: "OTP invalide ou expiré" });
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mdp, salt);

    // Afficher le mot de passe haché pour vérification
    console.log("Mot de passe haché sauvegardé :", hashedPassword);

    // Mettre à jour le mot de passe de l'utilisateur avec le mot de passe haché
    user.mdp = hashedPassword;
    user.otp = undefined;
    user.otpExpire = undefined;

    // Sauvegarder les modifications dans la base de données
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la réinitialisation du mot de passe." });
  }
};
