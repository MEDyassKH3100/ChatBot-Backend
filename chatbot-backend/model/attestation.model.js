const mongoose = require("mongoose");
const db = require("../config/db");

// Importer le modèle User
const User = require("./user.model");

const { Schema } = mongoose;

const attestationSchema = new Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: { type: String, required: true },
  dateIssued: { type: Date, default: Date.now },
  fullName: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: String, required: true },
  issuedBy: { type: String, default: "Université Esprit" },
  status: {
    type: String,
    enum: ["Validé", "En attente", "Refusé"],
    default: "En attente",
  },

  additionalDetails: { type: String, default: "" },
  pdfPath: { type: String },
 
});

// Middleware pour générer le fullName avant de sauvegarder
attestationSchema.pre("save", async function (next) {
  const user = await User.findById(this.studentId);
  if (user) {
    this.fullName = `${user.prenom} ${user.nom}`;
  }
  next();
});


// Exportation du modèle d'attestation
module.exports = mongoose.model("Attestation", attestationSchema);
