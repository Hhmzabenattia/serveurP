const express = require("express");
const { authMiddleware } = require("../Middleware/authMiddleware");
const expressAsyncHandler = require("express-async-handler");
const Document = require("../Models/documentModel");
const documentRouter = express.Router();
const cloudinary = require('cloudinary').v2


documentRouter.get(
  "/",
  authMiddleware,
  expressAsyncHandler(async (req, res) => {
    const document = await Document.find({ createdby: req.user._id }).populate("createdby", "firstname lastname");;
    res.json(document);
  })
);


documentRouter.get(
  "/:id",
  authMiddleware,
  expressAsyncHandler(async (req, res) => {
    const document = await Document.findById(req.params.id).populate("createdby", "firstname lastname");;
    res.json(document);
  })
);


documentRouter.post("/",authMiddleware, async (req, res, next) => {
  const { name,category,description } = req.body;

  try {
    const doc = await Document.findOne({ name });
    if (doc) {
      return res.status(400).json({ message: "Docuement existe déjà" });
    }

    const result = await cloudinary.uploader.upload(req.body.path, {
      folder: `Document/${name}`,
      crop: "scale",
      format:"pdf",
    });


    const newDoc = await Document.create({
      name,
      category,
      description,
      createdby: req.user.id,
      createdAt: Date.now(),
      path:result.secure_url

    });
    if (newDoc) {
      res.status(200).json({
        message: "La creation de Document est réussie.",
      });
    }
  } catch (error) {
    next(new Error(error.message, 500));     }
});


documentRouter.delete(
  "/:id",
  authMiddleware,
  expressAsyncHandler(async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);

      if (!document) {
        return res.status(404).json({ message: "Document non trouver" });
      }

      await document.deleteOne();

      res.json({ message: "document supprimée avec succès" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  })
);






module.exports = documentRouter;
