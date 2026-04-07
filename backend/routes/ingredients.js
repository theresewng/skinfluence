const express = require("express");
const router = express.Router();
const Ingredient = require("../models/Ingredients");
const verifyToken = require("../middleware/authMiddleware");

// GET all unique categories for filter dropdown
router.get("/categories/all", async (req, res) => {
  try {
    const categories = await Ingredient.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ingredients with optional search and category filter
router.get("/", async (req, res) => {
  try {
    const { limit, skip = 0, search = "", category = "" } = req.query;
    const parsedLimit = limit ? parseInt(limit) : null;
    const parsedSkip = parseInt(skip);

    const query = {
      ...(search && {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { short_description: { $regex: search, $options: "i" } },
          { what_is_it: { $regex: search, $options: "i" } },
        ],
      }),
      ...(category && { category: { $regex: `^${category}$`, $options: "i" } }),
    };

    let dbQuery = Ingredient.find(query).skip(parsedSkip);
    if (parsedLimit) dbQuery = dbQuery.limit(parsedLimit);

    const ingredients = await dbQuery;
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single ingredient by ID
router.get("/:id", async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient)
      return res.status(404).json({ message: "Ingredient not found" });
    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new ingredient (admin only)
router.post("/", verifyToken, async (req, res) => {
  try {
    const newIngredient = new Ingredient(req.body);
    await newIngredient.save();
    res.status(201).json(newIngredient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ingredient by ID (admin only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Ingredient.findByIdAndDelete(req.params.id);
    res.json({ message: "Ingredient deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
