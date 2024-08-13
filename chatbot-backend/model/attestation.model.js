const mongoose = require("mongoose");
const db = require("../config/db");

const { Schema } = mongoose;

// Définition du schéma pour une attestation
const attestationSchema = new Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Référence à l'utilisateur
  type: { type: String, required: true }, // Type d'attestation (ex : "Attestation de Scolarité")
  dateIssued: { type: Date, default: Date.now }, // Date d'émission de l'attestation
  fullName: { type: String, required: true }, // Nom complet de l'étudiant (concaténation du prénom et nom)
  course: { type: String, required: true }, // Le parcours ou programme d'étude
  year: { type: Date, required: true }, // Année académique (de type Date)
  issuedBy: { type: String, default: "Université Esprit" }, // Autorité émettrice
  status: {
    type: String,
    enum: ["Validé", "En attente", "Refusé"],
    default: "En attente",
  }, // Statut de l'attestation
  additionalDetails: { type: String, default: "" }, // Détails supplémentaires
});

// Middleware pour générer le fullName avant de sauvegarder le document
attestationSchema.pre("save", async function (next) {
  const user = await mongoose.model("User").findById(this.studentId);
  if (user) {
    this.fullName = `${user.prenom} ${user.nom}`;
  }
  next();
});

// Exportation du modèle d'attestation
module.exports = mongoose.model("Attestation", attestationSchema);
