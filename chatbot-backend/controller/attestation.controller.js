const Attestation = require("../model/attestation.model");
const User = require("../model/user.model");
const mongoose = require("mongoose");
const PDFKit = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
//faire une reclamation
exports.createAttestation = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user.id);

    // Si ce n'est pas une réclamation, on vérifie le paymentReceipt
    if (
      req.body.type &&
      req.body.type !== "Reclamation" &&
      !req.body.paymentReceipt
    ) {
      return res.status(400).json({
        message: "Le reçu de paiement est requis pour ce type d'attestation.",
      });
    }

    const attestation = new Attestation({
      studentId: studentId,
      fullName: `${req.user.prenom} ${req.user.nom}`, // Nom complet de l'utilisateur connecté
      type: req.body.type || "Reclamation", // Type d'attestation, par défaut "Réclamation"
      course: req.body.course, // Cours saisi dans la requête
      year: `${req.body.year}/${parseInt(req.body.year) + 1}`, // Année universitaire formatée
      status: "En attente", // Statut initial
      additionalDetails: req.body.additionalDetails || "", // Détails supplémentaires s'il y en a
      paymentReceipt: req.body.paymentReceipt || null, // Reçu de paiement, peut être null pour les réclamations
    });

    await attestation.save(); // Enregistrer l'attestation
    res.status(200).send(attestation); // Envoyer l'attestation créée en réponse
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
      return res.status(500).send({
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

exports.generateStageRequestPDF = async (req, res) => {
  try {
    const { paymentReceipt, fullName, course, year } = req.body;

    // Vérifier que les informations d'entrée sont présentes
    if (!paymentReceipt || !fullName || !course || !year) {
      return res.status(400).json({
        message: "Tous les champs doivent être remplis.",
      });
    }

    console.log("ID utilisateur dans la requête :", req.user.id); // Assurez-vous que vous utilisez 'id' ici
    const user = await User.findById(req.user.id); // Assurez-vous d'utiliser 'id' ici
    if (!user) {
      return res.status(400).json({
        message: "Utilisateur non trouvé.",
      });
    }
    // Ajoutez un log pour vérifier si l'utilisateur est trouvé
    console.log("Utilisateur trouvé :", user);
    console.log("Reçu fourni :", paymentReceipt);
    console.log("Reçu dans la base de données :", user.paymentReceipt);

    // Comparer les reçus de paiement
    if (
      !user.paymentReceipt ||
      user.paymentReceipt.toUpperCase() !== paymentReceipt.toUpperCase()
    ) {
      return res.status(400).json({
        message: "Reçu de paiement invalide. Veuillez entrer un reçu valide.",
      });
    }
    // Charger le template PDF
    try {
      const templatePath = path.join(__dirname, "../templates/attestation.pdf");
      const existingPdfBytes = fs.readFileSync(templatePath);

      // Charger le document PDF à partir du template
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Charger les polices
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBoldFont = await pdfDoc.embedFont(
        StandardFonts.TimesRomanBold
      );

      // Gérer la date actuelle dans le format DD/MM/YYYY
      const currentDate = new Date();
      const formattedDate = `${String(currentDate.getDate()).padStart(
        2,
        "0"
      )}/${String(currentDate.getMonth() + 1).padStart(
        2,
        "0"
      )}/${currentDate.getFullYear()}`;

      // Calculer la largeur du texte pour centrer les paragraphes
      const drawTextCentered = (text, y, font, size) => {
        const textWidth = font.widthOfTextAtSize(text, size);
        const pageWidth = firstPage.getWidth();
        const x = (pageWidth - textWidth) / 2;
        firstPage.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
      };

      // Remplacer la date en haut à droite
      firstPage.drawText(`Tunis, le : ${formattedDate}`, {
        x: 400,
        y: 750,
        size: 12,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });

      // Ajouter le contenu spécifique en centrant le texte
      drawTextCentered(
        "A l’aimable attention de la Direction Générale",
        700,
        timesRomanBoldFont,
        12
      );
      drawTextCentered("Objet: Demande de Stage", 680, timesRomanBoldFont, 12);
      drawTextCentered("Madame, Monsieur,", 660, timesRomanFont, 12);
      drawTextCentered(
        "L’Ecole Supérieure Privée d’Ingénierie et de Technologies, ESPRIT SA, est un établissement",
        640,
        timesRomanFont,
        12
      );
      drawTextCentered(
        "d’enseignement supérieur privé ayant pour objet principal, la formation d’ingénieurs dans les domaines",
        620,
        timesRomanFont,
        12
      );
      drawTextCentered(
        "des technologies de l’information et de la communication.",
        600,
        timesRomanFont,
        12
      );
      drawTextCentered(
        "Notre objectif consiste à former des ingénieurs opérationnels au terme de leur formation.",
        580,
        timesRomanFont,
        12
      );
      drawTextCentered(
        "Dès lors, nous encourageons nos élèves à mettre en pratique le savoir et les compétences qu’ils ont acquis",
        560,
        timesRomanFont,
        12
      );
      drawTextCentered(
        "au cours de leur cursus universitaire.",
        540,
        timesRomanFont,
        12
      );
      drawTextCentered(
        "C’est également dans le but de les amener à s’intégrer dans l’environnement de l’entreprise que nous vous",
        520,
        timesRomanFont,
        12
      );
      drawTextCentered(
        "demandons de bien vouloir accepter :",
        500,
        timesRomanFont,
        12
      );

      drawTextCentered(
        `L’étudiant(e) : ${fullName}`,
        480,
        timesRomanBoldFont,
        12
      );
      drawTextCentered(
        `Inscrit(e) en : ${course}`,
        460,
        timesRomanBoldFont,
        12
      );
      drawTextCentered(
        "Pour effectuer un stage obligatoire, au sein de votre honorable société.",
        440,
        timesRomanFont,
        12
      );
      drawTextCentered(
        "Nous restons à votre entière disposition pour tout renseignement complémentaire.",
        420,
        timesRomanFont,
        12
      );
      drawTextCentered(
        "En vous remerciant pour votre précieux soutien, nous vous prions d’agréer, Madame, Monsieur,",
        400,
        timesRomanFont,
        12
      );
      drawTextCentered(
        "l’expression de nos salutations distinguées.",
        380,
        timesRomanFont,
        12
      );

      // Enregistrer le PDF modifié
      const pdfBytes = await pdfDoc.save();
      const outputPath = path.join(
        __dirname,
        `../public/attestation_de_stage${Date.now()}.pdf`
      );
      fs.writeFileSync(outputPath, pdfBytes);

      // Ajouter l'attestation à la base de données avec statut "Validé"
      const newAttestation = new Attestation({
        studentId: req.user.id,
        fullName,
        type: "Attestation de Stage",
        course,
        year,
        paymentReceipt, // Enregistrement du reçu de paiement
        status: "Validé", // Statut validé car le reçu est correct
      });

      await newAttestation.save();

      // Envoyer le fichier PDF généré en réponse
      res.download(outputPath);
    } catch (pdfError) {
      console.error("Erreur lors de la génération du PDF:", pdfError);
      return res.status(400).json({
        message: "Erreur lors de la génération du PDF",
        error: pdfError,
      });
    }
  } catch (error) {
    console.error("Erreur lors de la requête:", error);
    res.status(400).send({
      message: "Erreur lors de la génération du PDF",
      error,
    });
  }
};
