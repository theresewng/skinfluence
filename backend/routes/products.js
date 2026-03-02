const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const verifyToken = require("../middleware/authMiddleware");

// GET ROUTE (Public - Anyone can see plants)
router.get("/", async (req, res) => {
  try {
    //const plants = await Plant.find().limit(3);
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST ROUTE (protected - only logged in users)
router.get("/", verifyToken, async (req, res) => {
  const products = new Product({
    productName: req.body.productName,
    brand: req.body.brand,
    usageType: req.body.usageType,
    category: req.body.category,
    ingredients: req.body.ingredients,
    imageURL: req.body.imageURL,
  });

  try {
    const newProduct = await products.save();
    res.status(201).json(newProduct);
    console.log(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE ROUTE (protected - only logged in users)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Plant deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
