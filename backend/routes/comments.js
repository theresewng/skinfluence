const express = require("express");
const router = express.Router();
const Comment = require("../models/Comments");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");

// PUBLIC - anyone can view comments for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const comments = await Comment.find({
      productId: req.params.productId,
    }).sort({ createdAt: -1 }); // newest first
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new comment on a product (protected)
router.post("/product/:productId", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

// DELETE a comment (only by the user who posted it OR admin)
router.delete("/:commentId", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is owner or admin
    if (comment.userId.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

// GET comments by user ID (for admin to view user activity)
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
