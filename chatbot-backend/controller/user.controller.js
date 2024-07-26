const UserModel = require('../model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');





exports.register = (req,res)=>{
/*
const user = new UserModel(req.body)
user.save()
*/

    UserModel.create(req.body)
    .then(newuser => res.status(200).json(newuser))
    .catch(err => res.status(400).json(err))
}




exports.getAll =(req,res) =>{
UserModel.find()
.then(users => res.status(200).json(users))
.catch(err => res.status(400).json(err))

}

exports.login = async (req, res) => {
    const { email, mdp } = req.body;
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Utilisateur non trouvé" });
      }
      const isMatch = await bcrypt.compare(mdp, user.mdp);
      if (!isMatch) {
        return res.status(400).json({ message: "Mot de passe incorrect" });
      }
      const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.status(200).json({ token, user });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
