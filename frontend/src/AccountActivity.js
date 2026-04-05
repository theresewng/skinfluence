import { useContext, useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function AccountActivity() {
  // Get user ID of admin from URL params, and auth context for token and user info
  const { id: userId } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Details for the selected user and their activity
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileProducts, setProfileProducts] = useState([]);
  const [profileIngredients, setProfileIngredients] = useState([]);
  const [profileComments, setProfileComments] = useState([]);

  // Loading state while fetching data
  const [loading, setLoading] = useState(true);

  // If they aren't an admin, redirect them out
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/login");
    }
  }, [token, user, navigate]);

  // Fetch user data and activity
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Fetch user details (1), saved products (2), saved ingredients (3), and comments (4)
  const fetchUserData = async () => {
    try {
      setLoading(true);

      // (1) Fetch user details from backend
      const userRes = await fetch(
        `http://localhost:5000/api/auth/users/${userId}`,
      );
      if (!userRes.ok) {
        console.error("Failed to fetch user");
        return;
      }
      // Extract user details and saved product/ingredient IDs
      const profileData = await userRes.json();
      setSelectedProfile(profileData);

      // (2) Fetch saved products details from product IDs
      if (profileData?.savedProductIDs?.length > 0) {
        // Get details for each saved product ID
        const productPromises = profileData.savedProductIDs.map((id) =>
          fetch(`http://localhost:5000/api/products/${id}`).then((res) =>
            res.json(),
          ),
        );
        const products = await Promise.all(productPromises); // Promise.all waits for all fetches to complete
        setProfileProducts(products.filter((p) => p)); // Filter out any null results
      }

      // (3) Fetch saved ingredients details from ingredient IDs
      if (profileData?.savedIngredientIDs?.length > 0) {
        // Get details for each saved ingredient ID
        const ingredientPromises = profileData.savedIngredientIDs.map((id) =>
          fetch(`http://localhost:5000/api/ingredients/${id}`).then((res) =>
            res.json(),
          ),
        );
        const ingredients = await Promise.all(ingredientPromises); // Wait for all fetches to complete
        setProfileIngredients(ingredients.filter((i) => i)); // Filter out any null results
      }

      // (4)Fetch user comments from comments route
      const commentsRes = await fetch(
        `http://localhost:5000/api/comments/user/${userId}`,
      );
      if (commentsRes.ok) {
        const comments = await commentsRes.json();
        setProfileComments(comments);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDelete = async () => {
    if (!selectedProfile) return;

    // Prevent deleting other admins
    if (selectedProfile.role === "admin") {
      alert("You cannot delete admin accounts.");
      return;
    }

    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this account?")) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/users/${selectedProfile.id}`,
        {
          method: "DELETE",
          // Add headers/token here for authentication
        },
      );
      if (!res.ok) {
        const data = await res.json();
        console.error("Failed to delete user:", data);
        alert("Failed to delete user: " + (data.message || "Unknown error"));
        return;
      }
      alert("User deleted successfully");

      setSelectedProfile(null);
      navigate("/admin"); // Go back to admin dashboard
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the user.");
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="page-container bkgd-purple">
        <p>Loading user activity...</p>
      </div>
    );
  }

  // If no user found, show error message
  if (!selectedProfile) {
    return (
      <div className="page-container bkgd-purple">
        <p>User not found.</p>
        <Link to="/admin">
          <button>← Back to Admin Dashboard</button>
        </Link>
      </div>
    );
  }

  // Main content showing selected user details and activity
  return (
    <div className="page-container bkgd-purple">
      <div className="space-between">
        <Link to="/admin">
          <button>← Back to Admin Dashboard</button>
        </Link>

        <button className="delete-button" onClick={handleDelete}>
          Delete This Account
        </button>
      </div>

      <header className="main-header">
        <p>Viewing account activity for…</p>
        <h2>{selectedProfile.username}</h2>
      </header>

      <div className="three-col-grid content-wrapper">
        {/* Favourite Products */}
        <section className="fav-products-section">
          <h3>Favourite Products ({profileProducts.length})</h3>
          {profileProducts.length === 0 ? (
            <p>This user has no saved products.</p>
          ) : (
            profileProducts.map((product) => (
              <article key={product._id}>
                <p>{product.brand}</p>
                <h4>{product.productName}</h4>
                <Link to={`/products/${product._id}`}>
                  <button>Go to Product&nbsp;&nbsp;→</button>
                </Link>
              </article>
            ))
          )}
        </section>

        {/* Favourite Ingredients */}
        <section className="fav-ingredients-section">
          <h3>Favourite Ingredients ({profileIngredients.length})</h3>
          {profileIngredients.length === 0 ? (
            <p>This user has no saved ingredients.</p>
          ) : (
            profileIngredients.map((ingredient) => (
              <article key={ingredient._id} className="activity-card">
                <h4>{ingredient.name || "Unknown Ingredient"}</h4>
                <Link to={`/ingredients/${ingredient._id}`}>
                  <button>Go to Ingredient&nbsp;&nbsp;→</button>
                </Link>
              </article>
            ))
          )}
        </section>

        {/* Comments */}
        <section className="comments-section">
          <h3>Comments ({profileComments.length})</h3>
          {profileComments.length === 0 ? (
            <p>This user has no comments.</p>
          ) : (
            profileComments.map((comment) => {
              // Determine if comment is on a product or ingredient, and set path accordingly
              const commentPath = comment.ingredientId
                ? `/ingredients/${comment.ingredientId}`
                : `/products/${comment.productId}`;

              return (
                <article key={comment._id} className="activity-card">
                  <h4>“{comment.text}”</h4>
                  <p>{new Date(comment.createdAt).toLocaleDateString()}</p>
                  <Link to={commentPath}>
                    <button>Go to Comment&nbsp;&nbsp;→</button>
                  </Link>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}

export default AccountActivity;
