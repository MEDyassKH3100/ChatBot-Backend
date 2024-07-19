const UserModel = require('../model/user.model');

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
