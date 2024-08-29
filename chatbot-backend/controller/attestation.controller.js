const Attestation = require("../model/attestation.model");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.createAttestation = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user._id);

    const attestation = new Attestation({
      studentId: studentId,
      fullName: `${req.user.prenom} ${req.user.nom}`,
      type: req.body.type,
      course: req.body.course,
      year: req.body.year,
      status: "En attente",
      additionalDetails: req.body.additionalDetails || "",
    });

    await attestation.save();
    res.status(200).send(attestation);
  } catch (error) {
    console.error(error); // Pour vérifier si l'erreur persiste
    res
      .status(400)
      .send({ message: "Erreur lors de la création de l'attestation", error });
  }
};

exports.getAllAttestations = async (req, res) => {
  try {
    const attestations = await Attestation.find();
    res.status(200).send(attestations);
  } catch (error) {
    res.status(400).send({
      message: "Erreur lors de la récupération des attestations",
      error,
    });
  }
};

exports.getAttestationById = async (req, res) => {
  try {
    const attestation = await Attestation.findById(req.params.id);
    if (!attestation) {
      return res.status(400).send({ message: "Attestation non trouvée" });
    }
    res.status(200).send(attestation);
  } catch (error) {
    res.status(400).send({
      message: "Erreur lors de la récupération de l'attestation",
      error,
    });
  }
};

exports.updateAttestation = async (req, res) => {
  try {
    const attestation = await Attestation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!attestation) {
      return res.status(400).send({ message: "Attestation non trouvée" });
    }
    res.status(200).send(attestation);
  } catch (error) {
    res.status(400).send({
      message: "Erreur lors de la mise à jour de l'attestation",
      error,
    });
  }
};

exports.deleteAttestation = async (req, res) => {
  try {
    const attestation = await Attestation.findByIdAndDelete(req.params.id);
    if (!attestation) {
      return res.status(400).send({ message: "Attestation non trouvée" });
    }
    res.status(200).send({ message: "Attestation supprimée avec succès" });
  } catch (error) {
    res.status(400).send({
      message: "Erreur lors de la suppression de l'attestation",
      error,
    });
  }
};

exports.generatePDF = async (req, res) => {
  try {
    const attestationId = req.params.id;
    console.log("Generating PDF for Attestation ID:", attestationId);

    const attestation = await Attestation.findById(attestationId).populate(
      "studentId"
    );

    if (!attestation) {
      console.log("Attestation not found");
      return res.status(400).send({ message: "Attestation non trouvée" });
    }

    // Créer le répertoire public s'il n'existe pas déjà
    const publicDir = path.join(__dirname, "../public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    // Générer le chemin du fichier PDF
    const filePath = path.join(publicDir, `attestation_${Date.now()}.pdf`);

    // Créer un nouveau document PDF
    const doc = new PDFDocument();

    // Ajouter une gestion des erreurs pour le WriteStream
    const writeStream = fs.createWriteStream(filePath);
    writeStream.on("error", (err) => {
      console.error("Erreur lors de l'écriture du fichier:", err);
      return res
        .status(500)
        .send({
          message: "Erreur lors de l'écriture du fichier PDF",
          error: err,
        });
    });

    doc.pipe(writeStream);

    // Ajouter le contenu au PDF
    doc.fontSize(25).text(`Attestation de Réussite`, { align: "center" });
    doc.moveDown();
    doc.fontSize(18).text(`Nom: ${attestation.fullName}`);
    doc.text(`Cours: ${attestation.course}`);
    doc.text(`Année: ${attestation.year.getFullYear()}`);
    doc.text(`Émis par: ${attestation.issuedBy}`);
    doc.text(`Détails supplémentaires: ${attestation.additionalDetails}`);

    // Finaliser le document PDF
    doc.end();

    // Envoyer le fichier PDF généré en réponse
    writeStream.on("finish", () => {
      res.download(filePath);
    });
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    res
      .status(500)
      .send({ message: "Erreur lors de la génération du PDF", error });
  }
};
