const UserModel = require('../model/user.model');
class UserService{
    static async registerUser(nom,prenom,cin,identifiant,email,mdp){
        try{
            const createUser = new UserModel ({nom,prenom,cin,identifiant,email,mdp});
            return await createUser.save();
        }catch(err){
            throw err;
        }
    }
}
module.exports = UserService;