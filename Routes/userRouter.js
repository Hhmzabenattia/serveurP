const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const { authMiddleware, Active } = require('../Middleware/authMiddleware');
const userRouter = express.Router();
const User = require('../Models/userModel');
const generateToken = require('../utils/auth');


userRouter.get(
    "/profile",
    authMiddleware,
    expressAsyncHandler(async (req, res) => {
      const user = await User.findById(req.user._id).select(`-password`);
      if (user) {
        res.json(
        user
        );
      } else {
        res.status(404);
        throw new Error("Utilisateur non trouvé");
      }
    })
  );


  userRouter.put(
    "/profile",
    authMiddleware,
    expressAsyncHandler(async (req, res) => {
   
      const existuser = await User.findById(req.user._id);
      if (existuser) {
        existuser.firstname = req.body.firstname || existuser.firstname;
        existuser.lastname = req.body.lastname || existuser.lastname;
        existuser.email = req.body.email || existuser.email;
        if (req.body.password) 
        {
          existuser.password = req.body.password;
        }
        
        const user = await existuser.save();
        res.json({
          message:"Mot de passe modifié avec succès",user
        });
      } else {
        res.status(404);
        throw new Error("Utilisateur non trouvé");
      }
    
    })
  );
  


module.exports = userRouter;