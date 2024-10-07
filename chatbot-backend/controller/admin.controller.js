const Attestation = require("../model/attestation.model");
const User = require("../model/user.model");
const mongoose = require("mongoose");

// Fonction pour obtenir le nombre total d'utilisateurs
exports.getTotalClient = async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({ totalClients: userCount });
    } catch (error) {
        res.status(400).send({ message: "Erreur lors de la récupération du nombre d'utilisateurs", error });
    }
};

// Fonction pour obtenir le nombre total d'administrateurs
exports.getTotalAdmins = async (req, res) => {
    try {
        const adminCount = await User.countDocuments({ role: 'admin' });
        res.json({ totalAdmins: adminCount });
    } catch (error) {
        res.status(400).send({ message: "Erreur lors de la récupération du nombre d'administrateurs", error });
    }
};
// Fonction pour obtenir le nombre total d'administrateurs
exports.getTotalUsers = async (req, res) => {
    try {
        const userCount = await User.countDocuments({ role: 'user' });
        res.json({ totalUsers: userCount });
    } catch (error) {
        res.status(400).send({ message: "Erreur lors de la récupération du nombre d'administrateurs", error });
    }
};
// Fonction pour obtenir le nombre total d'attestations
exports.getTotalAttestations = async (req, res) => {
    try {
        const attestationCount = await Attestation.countDocuments();
        res.json({ totalAttestations: attestationCount });
    } catch (error) {
        res.status(400).send({ message: "Erreur lors de la récupération du nombre d'attestations", error });
    }
};

// Fonction pour obtenir le nombre total de réclamations
exports.getTotalReclamations = async (req, res) => {
    try {
        const reclamationCount = await Attestation.countDocuments({ type: 'Reclamation' });
        res.json({ totalReclamations: reclamationCount });
    } catch (error) {
        res.status(400).send({ message: "Erreur lors de la récupération du nombre de réclamations", error });
    }
};

// Fonction pour obtenir le nombre total de réclamations
exports.getTotalAttestationStage = async (req, res) => {
    try {
        const reclamationCount = await Attestation.countDocuments({ type: 'Attestation de Stage' });
        res.json({ totalReclamations: reclamationCount });
    } catch (error) {
        res.status(400).send({ message: "Erreur lors de la récupération du nombre des Attestations du Stage", error });
    }
};

// Fonction pour afficher les activités des utilisateurs (simplifiée)
exports.getUserActivities = async (req, res) => {
    try {
        const activities = await User.find().select('name activityLogs');
        res.json(activities);
    } catch (error) {
        res.status(400).send({ message: "Erreur lors de la récupération des activités des utilisateurs", error });
    }
};

// Fonctions pour la gestion de filtrage et de recherche (simplifiée)
exports.filterUsers = async (req, res) => {
    try {
        const filters = req.query; // Prend les filtres depuis les paramètres de la requête
        const users = await User.find(filters);
        res.json(users);
    } catch (error) {
        res.status(400).send({ message: "Erreur lors du filtrage des utilisateurs", error });
    }
};
exports.filterAttestations = async (req, res) => {
    try {
        const filters = req.query; // Prend les filtres depuis les paramètres de la requête
        const Attestations = await Attestation.find(filters);
        res.json(Attestations);
    } catch (error) {
        res.status(400).send({ message: "Erreur lors du filtrage des utilisateurs", error });
    }
};


