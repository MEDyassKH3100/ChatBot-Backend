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

router.route("/forgotpassword").post(UserController.forgotPassword);

router.route("/resetpassword/:token").post(UserController.resetPassword);

router.get("/resetpassword/:token", (req, res) => {
  // Afficher une page ou renvoyer un message confirmant l'existence du token et permettant à l'utilisateur de réinitialiser son mot de passe.
  res.status(200).send("Page de réinitialisation du mot de passe");
});

router.get("/verifyemail/:token", UserController.verifyEmail); // Route pour la vérification de l'e-mail

module.exports = router;
