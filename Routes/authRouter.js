const express = require("express");
const authRouter = express.Router();
const User = require("../Models/userModel");
const generateToken = require("../utils/auth");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");







// Login route
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "email ou mot de passe invalide" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "email ou mot de passe invalide" });
    }

    generateToken(res, user.id);
    res.status(200).json({
      message: "Connexion réussie.",
      user: {
        id: user.id,
        email: user.email,
        isAdmin:user.isAdmin,
        isActive:user.isActive
      },
    });
  } catch (error) {
    next(new Error(error.message, 500));   }
});


//Register route

authRouter.post("/", async (req, res, next) => {
  const { firstname,lastname,role,email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "L'utilisateur existe déjà" });
    }

    const newuser = await User.create({
      firstname,
      lastname,
      email,
      password,
      role,
    });
    if (newuser) {
      generateToken(res, newuser.id);
      res.status(200).json({
        message: "La creation de compt est réussie.",
        user: {
          id: newuser.id,
          email: newuser.email,
          isAdmin:newuser.isAdmin,
          isActive:newuser.isActive
        },
      });
    }
  } catch (error) {
    next(new Error(error.message, 500));     }
});


// Forgot password Route

authRouter.post("/password/forgot", async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new Error("Utilisateur introuvable", 404));
  }

  const resetToken = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `http://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Lien de réinitialisation du mot de passe",
      message: `<b>Votre lien de réinitialisation de mot de passe est :</b> <a href="${resetPasswordUrl}">${resetPasswordUrl}<a>`,
    });
    res.status(200).json({
      success: true,
      message: `Lien de réinitialisation du mot de passe envoyé à ${user.email} avec succès`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new Error(error.message, 500));
  }
});

// Change password Route


authRouter.put("/password/reset/:token", async (req, res, next) => {

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(404).json({ message: "Code de réinitialisation du mot de passe non valide" });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(res, user.id);
  res.status(201).json({
    message: "Mot de passe changé avec succès !",
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

// Logout Route

authRouter.get("/logout", async (req, res) => {
  return res
    .clearCookie("token")
    .status(200)
    .json({ message: "Déconnecté avec succès" });
});

module.exports = authRouter;
