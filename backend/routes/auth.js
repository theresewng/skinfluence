const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // 2. hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. save the user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. find user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    // 2. compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // 3. generate token  ("wristband")
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "1h" },
    );

    // 4. send token and user data (including savedProductIDs) back to frontend
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        savedProductIDs: user.savedProductIDs,
        savedIngredientIDs: user.savedIngredientIDs,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users (for admin page) - TEMPORARILY REMOVED verifyToken FOR TESTING
// router.get("/users", verifyToken, async (req, res) => {
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id username"); // Select _id and username
    const userData = users.map((user) => ({
      id: user._id,
      username: user.username,
    }));
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user by ID (for admin page)
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    // https://www.geeksforgeeks.org/mongodb/mongoose-findbyidanddelete-function/
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user data (protected - includes savedProductIDs)
router.get("/user", verifyToken, async (req, res) => {
  try {
    // 1. Find user based on userId from token (from middleware)
    const userId = req.userId;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Send user data (including savedProductIDs) back to frontend
    res.json({
      id: user._id,
      username: user.username,
      savedProductIDs: user.savedProductIDs,
      savedIngredientIDs: user.savedIngredientIDs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST product ID string to user's favorites
router.post("/save-product", verifyToken, async (req, res) => {
  try {
    // 1. Extract product ID string from request body
    const { productId } = req.body;

    // 2. Find user based on userId from token (from middleware)
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3. Add product ID to savedProductIDs if not already there
    if (!user.savedProductIDs.includes(productId)) {
      user.savedProductIDs.push(productId); // add to array
      await user.save(); // save to DB
    }

    // 4. Send updated list of savedProductIDs back to frontend
    res.json({
      message: "Product saved successfully",
      savedProductIDs: user.savedProductIDs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/save-ingredient", verifyToken, async (req, res) => {
  try {
    const { ingredientId } = req.body;
    const userId = req.userId;

    if (!ingredientId) {
      return res.status(400).json({ message: "Ingredient ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.savedIngredientIDs.includes(ingredientId)) {
      user.savedIngredientIDs.push(ingredientId);
      await user.save();
    }

    res.json({
      message: "Ingredient saved successfully",
      savedIngredientIDs: user.savedIngredientIDs,
    });
  } catch (err) {
    console.error("SAVE INGREDIENT ERROR:", err); // 👈 add this
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
