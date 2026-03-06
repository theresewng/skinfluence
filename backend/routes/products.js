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

router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// POST ROUTE (protected - only logged in users)
// router.get("/", verifyToken, async (req, res) => {
//   const products = new Product({
//     productName: req.body.productName,
//     brand: req.body.brand,
//     usageType: req.body.usageType,
//     category: req.body.category,
//     ingredients: req.body.ingredients,
//     imageURL: req.body.imageURL,
//   });

//   try {
//     const newProduct = await products.save();
//     res.status(201).json(newProduct);
//     console.log(newProduct);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// router.get("/", async (req, res) => {
//   const limit = parseInt(req.query.limit) || 30;
//   const skip = parseInt(req.query.skip) || 0;

//   const products = await Product.find().skip(skip).limit(limit);

//   res.json(products);
// });
