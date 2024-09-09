const UserModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "chatesprit3@gmail.com",
    pass: "vdhu sqjt wuid vjkr",
  },
});

/*exports.register = (req, res) => {
  /*
const user = new UserModel(req.body)
user.save()


  UserModel.create(req.body)
    .then((newuser) => res.status(200).json(newuser))
    .catch((err) => res.status(400).json(err));
};*/

/*exports.register = async (req, res) => {
  try {
    const { email } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "L'utilisateur existe déjà" });
    }

    // Créer un nouvel utilisateur (mais ne pas le sauvegarder tout de suite)
    const newUser = new UserModel(req.body);

    // Générer un jeton de vérification
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpire = Date.now() + 24 * 60 * 60 * 1000; // Le jeton expire dans 24 heures

    newUser.verificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
    newUser.verificationExpire = verificationExpire;

    // Sauvegarder l'utilisateur
    await newUser.save();

    // Envoyer un e-mail de vérification
    const verificationUrl = `http://localhost:3000/user/verifyemail/${verificationToken}`;
    const message = `Veuillez vérifier votre adresse e-mail en cliquant sur le lien suivant : \n\n ${verificationUrl}`;

    await transporter.sendMail({
      to: newUser.email,
      subject: "Vérification de l'adresse e-mail",
      text: message,
    });

    res.status(200).json({ message: "Inscription réussie. Veuillez vérifier votre e-mail pour valider votre compte." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const verificationToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  try {
    const user = await UserModel.findOne({
      verificationToken,
      verificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Le jeton est invalide ou a expiré" });
    }

    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    user.isVerified = true; // Marquer l'utilisateur comme vérifié

    await user.save();

    res.status(200).json({ message: "E-mail vérifié avec succès" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};*/



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

    res.status(200).json({ message: "Inscription réussie. Veuillez vérifier votre e-mail pour valider votre compte." });
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
      return res.status(400).json({ message: "Le jeton est invalide ou a expiré" });
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

exports.login = async (req, res) => {
  const { email, mdp } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Veuillez vérifier votre e-mail avant de vous connecter" });
    }

    const isMatch = await bcrypt.compare(mdp, user.mdp);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Envoyer un email avec le lien de réinitialisation
    const resetUrl = `http://localhost:3000/user/resetpassword/${resetToken}`;
    const message = `Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien suivant pour réinitialiser votre mot de passe : \n\n ${resetUrl}`;

    await transporter.sendMail({
      to: user.email,
      subject: "Réinitialisation du mot de passe",
      text: message,
    });

    res.status(200).json({ message: "Email envoyé avec succès" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await UserModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    user.mdp = req.body.mdp;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
