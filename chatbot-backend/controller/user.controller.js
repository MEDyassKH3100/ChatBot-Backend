const UserService = require('../services/user.services');

exports.register = async(req,res,next)=>{
    try{
        const {nom,prenom,cin,identifiant,email,mdp} = req.body;
        const successRes = await UserService.registerUser(nom, prenom, cin, identifiant, email, mdp);
        res.json({status:true,success:"User Registered Successfuly"});
    } catch (error){
        res.status(500).json({ status: false, error: 'User Registration Failed' });
    }
}