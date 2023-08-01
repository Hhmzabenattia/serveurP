const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const {
  adminMiddleware,
  authMiddleware,
} = require("../Middleware/authMiddleware");
const adminRouter = express.Router();
const User = require("../Models/userModel");





// Get User by ID


adminRouter.get(
  "/users/:id",authMiddleware,adminMiddleware,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error("Utilisateur non trouvé");
    }
  })
);




// Delete User

adminRouter.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  expressAsyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      user.isActive=!user.isActive;

       user.save();

      res.json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  })
);



// Edit user by admin

adminRouter.put(
  "/users/:id",authMiddleware,adminMiddleware,
  expressAsyncHandler(async (req, res) => {
    const { firstname,lastname,email,password,isAdmin,role,isActive } = req.body;
    
  
  const user = await User.findById(req.params.id);
  if (user) {
    user.firstname = firstname || user.firstname;
    user.lastname = lastname || user.lastname;
    user.email = email || user.email;
    user.password = password || user.password;
    user.isAdmin = isAdmin || user.isAdmin;
    user.password = password || user.password;
    user.role = role || user.role;
    user.isActive = isActive || user.isActive;

    const updateduser = await user.save();
    res.json(updateduser);
  }
   
    else {
      res.status(404);
      throw new Error("Utilisateur non trouvé");
    }
  })
);


// GET ALL USER ADMIN
adminRouter.get(
  "/users/",
  authMiddleware,
  adminMiddleware,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  })
);

///////////////////////////////////////////







module.exports = adminRouter;
