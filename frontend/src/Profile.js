import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./App.css";

import blankHeart from "./assets/img/blankHeart.svg";
import filledHeart from "./assets/img/filledHeart.svg";

function MyProfile() {
  const [products, setProducts] = useState([]);
  const [savedProductIDs, setSavedProductIDs] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [savedIngredientIDs, setSavedIngredientIDs] = useState([]);
  const [comments, setComments] = useState([]);

  const { token, user } = useContext(AuthContext);

  // Load products from backend
  useEffect(() => {
    fetch(`http://localhost:5000/api/products?limit=30&skip=0`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Load ingredients from backend
  useEffect(() => {
    fetch(`http://localhost:5000/api/ingredients`)
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error("Error fetching ingredients:", err));
  }, []);

  // Fetch user's saved product and ingredient IDs
  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/auth/user", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ FIX
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setSavedProductIDs(data.savedProductIDs || []);
          setSavedIngredientIDs(data.savedIngredientIDs || []);
        })
        .catch((err) => console.error("Error fetching user data:", err));

      if (user?.id) {
        fetch(`http://localhost:5000/api/comments/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch comments");
            return res.json();
          })
          .then((data) => setComments(Array.isArray(data) ? data : []))
          .catch((err) => console.error("Error fetching comments:", err));
      }
    }
  }, [token, user]);

  // Filter all products and ingredients to get details of saved items
  const savedProducts = products.filter((product) => {
    return savedProductIDs.includes(product._id);
  });
  const savedIngredients = ingredients.filter((ingredient) =>
    savedIngredientIDs.includes(ingredient._id),
  );

  const handleRemoveProducts = async (id) => {
    const authToken = token?.trim();
    if (!authToken) {
      alert("You are not logged in!");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/remove-product",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ productId: id }),
        },
      );

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg);
      }

      // remove locally from UI
      setSavedProductIDs((prev) => prev.filter((pid) => pid !== id));

      alert("Removed from favourites!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  const handleRemoveIngredients = async (id) => {
    try {
      const authToken = token?.trim();
      if (!authToken) {
        alert("You are not logged in!");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/remove-ingredient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ ingredientId: id }),
        },
      );

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg);
      }

      // Remove locally from UI
      setSavedIngredientIDs((prev) => prev.filter((pid) => pid !== id));
      alert("Removed from favourites!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Main content showing selected user details and activity
  return (
    <div className="page-container bkgd-yellow">
      <header className="main-header">
        <p>Welcome back!</p>
        <h2>{user ? user.username : "Loading…"}</h2>
      </header>

      <div className="three-col-grid content-wrapper">
        {/* Favourite Products */}
        <section className="fav-products-section">
          <h3>Favourite Products ({savedProducts.length})</h3>
          {savedProducts.length === 0 ? (
            <p>You haven't saved any products yet.</p>
          ) : (
            savedProducts.map((product) => (
              <article key={product._id}>
                <button
                  className={`heart-button ${
                    savedProductIDs.includes(product._id) ? "saved" : ""
                  }`}
                  onClick={() => handleRemoveProducts(product._id)}
                >
                  <img
                    src={
                      savedProductIDs.includes(product._id)
                        ? filledHeart
                        : blankHeart
                    }
                    alt="Favourite"
                  />
                </button>
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
          <h3>Favourite Ingredients ({savedIngredients.length})</h3>
          {savedIngredients.length === 0 ? (
            <p>You haven't saved any ingredients yet.</p>
          ) : (
            savedIngredients.map((ingredient) => (
              <article key={ingredient._id}>
                <button
                  className={`heart-button ${
                    savedIngredientIDs.includes(ingredient._id) ? "saved" : ""
                  }`}
                  onClick={() => handleRemoveIngredients(ingredient._id)}
                >
                  <img
                    src={
                      savedIngredientIDs.includes(ingredient._id)
                        ? filledHeart
                        : blankHeart
                    }
                    alt="Favourite"
                  />
                </button>
                <h4>{ingredient.name}</h4>
                <Link to={`/ingredients/${ingredient._id}`}>
                  <button>Go to Ingredient&nbsp;&nbsp;→</button>
                </Link>
              </article>
            ))
          )}
        </section>

        {/* Comments */}
        <section className="comments-section">
          <h3>Comments ({comments.length})</h3>
          {comments.length === 0 ? (
            <p>You haven't made any comments yet.</p>
          ) : (
            comments.map((comment) => {
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

export default MyProfile;
