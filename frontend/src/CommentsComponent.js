import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import "./App.css";

// Comments component for both products and ingredients
// Pass EITHER productId OR ingredientId prop (not both)
function Comments({ productId, ingredientId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { token, user } = useContext(AuthContext);

  const currentUserId = user?._id || user?.id;

  // Determine which type of comment this is (product or ingredient)
  // and build the endpoint URL accordingly
  const isIngredientComment = !!ingredientId;
  const commentType = isIngredientComment ? "ingredient" : "product";
  const targetId = ingredientId || productId;
  const apiEndpoint = `http://localhost:5000/api/comments/${commentType}/${targetId}`;

  // Fetch comments when component loads or when the target ID changes
  // (public endpoint - no token needed for fetching)
  useEffect(() => {
    // Don't fetch if neither productId nor ingredientId is provided
    if (!targetId) return;

    fetch(apiEndpoint)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("Error fetching comments:", err));
  }, [targetId, apiEndpoint]);

  // Add a new comment (requires authentication token)
  const handleAddComment = async () => {
    if (!token) return alert("You must be logged in to comment");
    if (!newComment.trim()) return alert("Comment cannot be empty");

    try {
      // POST to the correct endpoint based on comment type (product or ingredient)
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (!response.ok) throw new Error("Failed to post comment");

      // Add the new comment to the top of the list and clear the input
      const savedComment = await response.json();
      setComments((prev) => [savedComment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
      alert(err.message);
    }
  };

  // Delete a comment (requires authentication and ownership or admin role)
  const handleDelete = async (commentId) => {
    if (!token) return alert("You must be logged in to delete comments");
    if (!window.confirm("Delete this comment?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to delete");

      // Remove the comment from the list
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId),
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Error deleting comment");
    }
  };

  return (
    <div className="comments-section">
      {/* Comment form - only visible to logged-in users */}
      {user && (
        <div className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button onClick={handleAddComment}>Post Comment</button>
        </div>
      )}

      {/* Message for visitors who are not logged in */}
      {!user && (
        <p style={{ fontStyle: "italic" }}>Login to leave a comment.</p>
      )}

      {/* Display all comments for this product/ingredient */}
      <div className="comment-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="comment-card">
              <h4>{comment.username}</h4>
              <p>{comment.text}</p>
              <small>
                {comment.createdAt
                  ? new Date(comment.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Just now"}
              </small>

              {/* delete button only for owner or admin */}
              {user &&
                (currentUserId === comment.userId?.toString() ||
                  user?.role === "admin") && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(comment._id)}
                  >
                    Delete Comment
                  </button>
                )}
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  );
}

export default Comments;
