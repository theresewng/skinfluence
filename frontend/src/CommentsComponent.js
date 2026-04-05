import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import "./App.css";

function Comments({ productId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { token, user } = useContext(AuthContext);

  const currentUserId = user?._id || user?.id;

  // fetch comments (public, no token needed)
  useEffect(() => {
    if (!productId) return;

    fetch(`http://localhost:5000/api/comments/product/${productId}`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error(err));
  }, [productId]);
  
  // add comment (requires token)
  const handleAddComment = async () => {
    if (!token) return alert("You must be logged in to comment");
    if (!newComment.trim()) return alert("Comment cannot be empty");

    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/product/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newComment }),
        },
      );

      if (!response.ok) throw new Error("Failed to post comment");

      const savedComment = await response.json();
      setComments((prev) => [savedComment, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // delete comment (requires token, user must own comment or be admin)
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

      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId),
      );
    } catch (err) {
      console.error(err);
      alert("Error deleting comment");
    }
  };

  return (
    <div className="comments-section">
      {/* comment form only for logged-in users */}
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

      {/* visitor message */}
      {!user && (
        <p style={{ fontStyle: "italic" }}>Login to leave a comment.</p>
      )}

      {/* comment list */}
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
