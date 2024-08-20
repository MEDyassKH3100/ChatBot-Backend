const express = require("express");
const router = express.Router();
const attestationController = require("../controller/attestation.controller");
const auth = require("../auth");

// Route pour créer une nouvelle attestation
router.post("/", auth, attestationController.createAttestation);

// Route pour récupérer toutes les attestations
router.get("/", auth, attestationController.getAllAttestations);

// Route pour récupérer une attestation par ID
router.get("/:id", auth, attestationController.getAttestationById);

// Route pour mettre à jour une attestation par ID
router.put("/:id", auth, attestationController.updateAttestation);

// Route pour supprimer une attestation par ID
router.delete("/:id", auth, attestationController.deleteAttestation);

module.exports = router;