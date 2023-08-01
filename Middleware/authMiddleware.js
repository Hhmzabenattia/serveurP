const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized no Token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    User.findById(decoded.id).then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Unauthorized Wrong User Data" });
      }

      if (user.isActive===false) {
        return res.status(401).json({ message: "Vous n'avez pas de compte actif, vous ne pouvez pas faire cette action" });
      }

      req.user = user;
     
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized no Token" });
  }
}

function adminMiddleware(req, res, next) {
  const user = req.user;

  if (!user || !user.isAdmin) {
    return res.status(401).json({ message: "Unauthorized as an Admin" });
  }
  next();
}



module.exports = { authMiddleware, adminMiddleware };
