const router = require("express").Router();
const UserController = require("../controller/user.controller");
const auth = require("../auth");

//router.post('/registration',UserController.register);
router
  .route("/")
  .post(UserController.register)
  /*.post(UserController.login)*/
  .get(UserController.getAll);

router.route("/login").post(UserController.login);

// Route pour demander un OTP pour la réinitialisation du mot de passe
router.post("/forgotpassword", UserController.forgotPassword);

// Route pour vérifier l'OTP et réinitialiser le mot de passe
router.post("/resetpassword", UserController.resetPassword);
router.get("/verifyemail/:token", UserController.verifyEmail); // Route pour la vérification de l'e-mail

module.exports = router;
