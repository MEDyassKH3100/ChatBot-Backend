const UserModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "chatesprit3@gmail.com",
    pass: "chatesprit123",
  },
});

exports.register = (req, res) => {
  /*
const user = new UserModel(req.body)
user.save()
*/

  UserModel.create(req.body)
    .then((newuser) => res.status(200).json(newuser))
    .catch((err) => res.status(400).json(err));
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
    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;
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
