const router = require ('express').Router();
const UserController = require ("../controller/user.controller");
const auth = require('../auth');

//router.post('/registration',UserController.register);
router.route("/")
.post(UserController.register)
/*.post(UserController.login)*/
.get(auth,UserController.getAll)
router.route('/login')
    .post(UserController.login);




module.exports = router ;