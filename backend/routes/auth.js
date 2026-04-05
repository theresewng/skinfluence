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
    const newUser = new User({
      username,
      password: hashedPassword,
      role: "user",
    });
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
        role: user.role,
      },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "1h" },
      // console.log("DECODED:", decoded),
    );

    console.log("TOKEN GENERATED:", token);

    // 4. send token and user data (including savedProductIDs) back to frontend

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        savedProductIDs: user.savedProductIDs,
        savedIngredientIDs: user.savedIngredientIDs,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET all users (for admin page) - TEMPORARILY REMOVED verifyToken FOR TESTING
// router.get("/users", verifyToken, async (req, res) => {
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id username role"); // Select _id, username, and role
    const userData = users.map((user) => ({
      id: user._id,
      username: user.username,
      role: user.role,
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

// GET user by ID (for admin to view user activity)
router.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user._id,
      username: user.username,
      role: user.role,
      savedProductIDs: user.savedProductIDs,
      savedIngredientIDs: user.savedIngredientIDs,
    });
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
// routes/auth.js (or wherever you handle auth)
router.post("/save-product", verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await User.findById(req.userId); // ✅ use req.userId
    if (!user) return res.status(404).json({ error: "User not found" });

    // add product ID if not already saved
    if (!user.savedProductIDs.includes(productId)) {
      user.savedProductIDs.push(productId);
      await user.save();
    }

    res.json({ message: "Product saved to favourites!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/remove-product", verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;

    const user = await User.findById(req.userId); // ✅ use req.userId
    if (!user) return res.status(404).json({ error: "User not found" });

    // remove product ID from savedProductIDs array
    user.savedProductIDs = user.savedProductIDs.filter(
      (id) => id !== productId,
    );
    await user.save();

    res.json({ message: "Removed from favourites!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save ingredient to favourites
// Save ingredient to user's favourites
router.post("/save-ingredient", verifyToken, async (req, res) => {
  try {
    const { ingredientId } = req.body;
    if (!ingredientId)
      return res.status(400).json({ message: "Ingredient ID required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.savedIngredientIDs.includes(ingredientId)) {
      user.savedIngredientIDs.push(ingredientId);
      await user.save();
    }

    res.json({
      message: "Ingredient saved",
      savedIngredientIDs: user.savedIngredientIDs,
    });
  } catch (err) {
    console.error("SAVE INGREDIENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Remove ingredient from user's favourites
router.post("/remove-ingredient", verifyToken, async (req, res) => {
  try {
    const { ingredientId } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedIngredientIDs = user.savedIngredientIDs.filter(
      (id) => id.toString() !== ingredientId.toString(),
    );
    await user.save();

    res.json({ message: "Ingredient removed from favourites" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
