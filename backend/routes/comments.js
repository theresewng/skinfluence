const express = require("express");
const router = express.Router();
const Comment = require("../models/Comments");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");

// GET comments for one product
router.get("/product/:productId", verifyToken, async (req, res) => {
  try {
    const comments = await Comment.find({
      productId: req.params.productId,
    }).sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new comment on a product
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
    console.log("=== DELETE REQUEST START ===");
    console.log("JWT userId:", req.userId);
    console.log("JWT role:", req.userRole);
    console.log("Requested commentId:", req.params.commentId);

    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      console.log("Comment not found");
      return res.status(404).json({ message: "Comment not found" });
    }

    console.log("Comment ownerId:", comment.userId.toString());

    // Check if user is owner or admin
    if (comment.userId.toString() !== req.userId && req.userRole !== "admin") {
      console.log(
        "Unauthorized DELETE attempt:",
        "UserId:",
        req.userId,
        "Role:",
        req.userRole,
        "CommentOwnerId:",
        comment.userId.toString(),
      );
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    await comment.deleteOne();
    console.log("Comment deleted successfully");

    res.json({ message: "Comment deleted successfully" });
    console.log("=== DELETE REQUEST END ===");
  } catch (err) {
    console.error("DELETE ERROR:", err);
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
