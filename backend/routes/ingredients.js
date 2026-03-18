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

    const ingredients = await query;

    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE PRODUCT BY ID
router.get("/:id", async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

router.post("/", verifyToken, async (req, res) => {
  try {
    const newIngredient = new Ingredient(req.body);
    await newIngredient.save();
    res.status(201).json(newIngredient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// router.get("/", async (req, res) => {
//   const limit = parseInt(req.query.limit) || 30;
//   const skip = parseInt(req.query.skip) || 0;

//   const products = await Product.find().skip(skip).limit(limit);

//   res.json(products);
// });

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
