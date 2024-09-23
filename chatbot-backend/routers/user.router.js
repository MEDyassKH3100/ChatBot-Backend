const router = require("express").Router();
const UserController = require("../controller/user.controller");
const auth = require("../auth");

router
  .route("/")
  .post(UserController.register) // Sign UP
  .get(UserController.getAll); // afficher les users
  
// Route pour ajouter un administrateur (seulement accessible aux admins)
router.post("/admin", auth("admin"), UserController.addAdmin);

//Sing In
router.route("/login").post(UserController.login);
// Récupérer les informations de l'utilisateur connecté
router.get("/profile", auth, UserController.getProfile);

//update profile
router.put("/profile", auth, UserController.updateProfile);

// Route pour demander un OTP pour la réinitialisation du mot de passe
router.post("/forgotpassword", UserController.forgotPassword);

// Route pour vérifier l'OTP et réinitialiser le mot de passe
router.post("/resetpassword", UserController.resetPassword);
router.get("/verifyemail/:token", UserController.verifyEmail); // Route pour la vérification de l'e-mail

module.exports = router;
