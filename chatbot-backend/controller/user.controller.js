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

// Sign up
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

// reçoit email de vérification
exports.verifyEmail = async (req, res) => {
  const verificationToken = req.params.token;

  try {
    const user = await UserModel.findOne({
      verificationToken,
      verificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send(`
        <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 20px;">
          <h1>Erreur</h1>
          <p>Le jeton est invalide ou a expiré.</p>
        </body>
        </html>
      `);
    }

    // Marquer l'utilisateur comme vérifié
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    user.isVerified = true;

    await user.save();

    // Envoyer une réponse HTML
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation de vérification</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f7f7f7;
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
              }
              .container {
                  background-color: #ffffff;
                  padding: 40px;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
                  text-align: center;
                  max-width: 400px;
              }
              h1 {
                  color: #4CAF50;
                  font-size: 24px;
              }
              p {
                  color: #555;
                  font-size: 16px;
                  margin-top: 20px;
              }
              a {
                  display: inline-block;
                  margin-top: 30px;
                  padding: 10px 20px;
                  background-color: #4CAF50;
                  color: white;
                  text-decoration: none;
                  border-radius: 5px;
                  transition: background-color 0.3s;
              }
              a:hover {
                  background-color: #45a049;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Votre e-mail a été vérifié !</h1>
              <p>Merci d'avoir confirmé votre adresse e-mail. Vous pouvez maintenant profiter pleinement de votre compte.</p>
              <a href="http://localhost:3000/login">Se connecter</a>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(400).send(`
      <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 20px;">
        <h1>Erreur technique</h1>
        <p>${error.message}</p>
      </body>
      </html>
    `);
  }
};

// Fonction pour ajouter un administrateur
exports.addAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(400)
        .json({
          message:
            "Accès refusé. Seuls les administrateurs peuvent effectuer cette action.",
        });
    }

    const { email, nom, prenom, mdp } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Un utilisateur avec cet email existe déjà." });
    }

    // Créer un nouvel utilisateur avec le rôle admin
    const newUser = new UserModel({
      nom,
      prenom,
      email,
      mdp,
      role: "admin",
    });

    newUser.mdp = mdp; // Assigner le nouveau mot de passe directement
    await newUser.save();


    


    res
      .status(200)
      .json({ message: "Administrateur ajouté avec succès.", user: newUser });
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Erreur lors de la création de l'administrateur.",
        error: error.message,
      });
  }
};
// Fonction pour bannir un utilisateur
exports.banUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(400)
        .json({
          message:
            "Accès refusé. Seuls les administrateurs peuvent effectuer cette action.",
        });
    }

    const { userId } = req.params; // L'ID de l'utilisateur à bannir est passé dans l'URL

    // Récupérer l'utilisateur dans la base de données
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé." });
    }

    // Modifier le statut de l'utilisateur pour indiquer qu'il est banni
    user.isBanned = true;
    await user.save();

    res
      .status(200)
      .json({
        message: "Utilisateur banni avec succès.",
        user: { id: user.id, nom: user.nom },
      });
  } catch (error) {
    res
      .status(400)
      .json({
        message: "Erreur lors du bannissement de l'utilisateur.",
        error: error.message,
      });
  }
};

// afficher tous les users
exports.getAll = (req, res) => {
  UserModel.find()
    .then((users) => res.status(200).json(users))
    .catch((err) => res.status(400).json(err));
};

// Fonction de login
exports.login = async (req, res) => {
  const { email, mdp } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    const isMatch = await bcrypt.compare(mdp, user.mdp);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "your_jwt_secret",
      {
        expiresIn: "1h",
      }
    );
    user.jwtToken = token;
    await user.save();
    console.log("Jeton généré lors de la connexion :", token); // Log du token généré
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer les informations de l'utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur à partir du token JWT
    const userId = req.user.id;
    console.log("User ID from token:", userId); // Log pour le débogage

    // Récupérer l'utilisateur dans la base de données
    const user = await UserModel.findById(userId).select("-mdp"); // Exclure le mot de passe
    console.log("Found user:", user); // Log pour le débogage

    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    // Renvoyer les informations de l'utilisateur
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(400).json({
      message: "Erreur lors de la récupération du profil",
      error: error.message,
    });
  }
};

// update user profile
exports.updateProfile = async (req, res) => {
  console.log("Update Profile: Start");
  try {
    if (!req.user || !req.user.id) {
      console.log("Update Profile: No user or user ID provided");
      return res.status(400).json({ message: "No authenticated user." });
    }
    console.log("Update Profile: User ID", req.user.id);

    const updates = req.body;
    console.log("Update Profile: Updates", updates);

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log("Update Profile: User not found");
      return res.status(400).json({ message: "User not found" });
    }

    console.log("Update Profile: Success", updatedUser);
    res.status(200).json({
      message: "Profile successfully updated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile: Error", error);
    res.status(400).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Route pour demander la réinitialisation du mot de passe
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    console.log("email", req.body);
    const user = await UserModel.findOne({ email: email });
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

    // Mettre à jour le mot de passe de l'utilisateur
    user.mdp = mdp; // Assigner le nouveau mot de passe directement
    user.otp = undefined;
    user.otpExpire = undefined;

    // Sauvegarder les modifications dans la base de données
    await user.save(); // Le middleware de hachage va s'activer ici

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "Erreur lors de la réinitialisation du mot de passe." });
  }
};
