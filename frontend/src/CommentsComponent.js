import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import "./App.css";

function Comments({ productId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { token, user } = useContext(AuthContext);

  const currentUserId = user?._id || user?.id;

  // ✅ fetch comments
  useEffect(() => {
    if (!token || !productId) return;

    fetch(`http://localhost:5000/api/comments/product/${productId}`, {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error("Error fetching comments:", err));
  }, [productId, token]);

  // ✅ add comment
  const handleAddComment = async () => {
    if (!productId) {
      console.error("productId is missing!");
      return;
    }

    if (!newComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/product/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
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

  // ✅ delete comment
  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to delete");

      // remove from UI instantly
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
      {user ? (
        <div className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button onClick={handleAddComment} disabled={!productId}>
            Post Comment
          </button>
        </div>
      ) : (
        <p>Please log in to leave a comment.</p>
      )}

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

              {currentUserId === comment.userId?.toString() && (
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
