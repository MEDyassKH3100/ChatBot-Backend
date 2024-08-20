const Attestation = require("../model/attestation.model");
const mongoose = require('mongoose');

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
      additionalDetails: req.body.additionalDetails || ""
    });

    await attestation.save();
    res.status(200).send(attestation);
  } catch (error) {
    console.error(error);  // Pour vérifier si l'erreur persiste
    res.status(400).send({ message: "Erreur lors de la création de l'attestation", error });
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
