const express = require("express");
const router = express.Router();
const Comment = require("../models/Comments");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");

// PUBLIC - anyone can view comments for a product
router.get("/product/:productId", async (req, res) => {
  try {
    // Find all comments with this productId, sorted newest first
    const comments = await Comment.find({
      productId: req.params.productId,
    }).sort({ createdAt: -1 }); // newest first
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new comment on a product (protected - requires authentication)
router.post("/product/:productId", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    // Validate comment text is not empty
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Get the user who is posting the comment
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new comment with productId (not ingredientId)
    const newComment = new Comment({
      productId: req.params.productId,
      userId: user._id,
      username: user.username,
      text,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET comments for an ingredient (public endpoint - anyone can view)
router.get("/ingredient/:ingredientId", async (req, res) => {
  try {
    // Find all comments with this ingredientId, sorted newest first
    const comments = await Comment.find({
      ingredientId: req.params.ingredientId,
    }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new comment on an ingredient (protected - requires authentication)
router.post("/ingredient/:ingredientId", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    // Validate comment text is not empty
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    // Get the user who is posting the comment
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new comment with ingredientId (not productId)
    const newComment = new Comment({
      ingredientId: req.params.ingredientId,
      userId: user._id,
      username: user.username,
      text,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a comment (only by the user who posted it OR admin)
router.delete("/:commentId", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the comment owner or an admin
    if (comment.userId.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET all comments by a specific user (for admin dashboard to view user activity)
// Returns all product AND ingredient comments posted by this user
router.get("/user/:userId", async (req, res) => {
  try {
    const comments = await Comment.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
