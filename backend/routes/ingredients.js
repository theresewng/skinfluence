const express = require("express");
const router = express.Router();
const Ingredient = require("../models/Ingredients");
const verifyToken = require("../middleware/authMiddleware");

// GET ROUTE (Public - Anyone can see plants)s
router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const skip = parseInt(req.query.skip) || 0;

    let query = Ingredient.find().skip(skip);

    if (limit) {
      query = query.limit(limit);
    }

    const products = await query;

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE PRODUCT BY ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Ingredient.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const newProduct = new Ingredient(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ROUTE (protected - only logged in users)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Ingredient.findByIdAndDelete(req.params.id);
    res.json({ message: "Ingredient deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
