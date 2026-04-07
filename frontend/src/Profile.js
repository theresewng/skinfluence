import { useContext, useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./App.css";

import heartSVG from "./assets/img/heart.svg";
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

  // Load products from backend
  useEffect(() => {
    fetch(`http://localhost:5000/api/ingredients`)
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch((err) => console.error("Error fetching ingredients:", err));
  }, []);

  // Fetch user's saved product IDs
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
    }
  }, [token]);

  // Load user data to get saved product IDs
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
  // return (
  //   <div className="page-container bkgd-yellow">
  //     <header
  //       className="main-header"
  //       style={{
  //         display: "flex",
  //         justifyContent: "space-between",
  //         alignItems: "center",
  //       }}
  //     >
  //       <div>{user && <h2>Welcome back, {user.username}!</h2>}</div>
  //     </header>

  //     <div className="content-wrapper">
  //       <div className="left-panel">
  //         <div className="card white-70">
  //           <h3 className="h3-ivy">My Skin</h3>
  //           <button>Edit Skin Profile</button>
  //           <h4 className="h4-neue">Skin Type</h4>
  //           <ul>
  //             <li>Oily skin</li>
  //           </ul>
  //           <h4 className="h4-neue">Skin Concerns</h4>
  //           <ul>
  //             <li>Acne</li>
  //             <li>Hyperpigmentation</li>
  //           </ul>
  //         </div>
  //       </div>

  //       <div className="right-panel">
  //         <section className="section white-70">
  //           <h2 className="h2-ivy">Saved Products</h2>
  //           {savedProducts.length > 0 ? (
  //             <div className="product-grid">
  //               {savedProducts.slice(0, visibleCount).map((product) => {
  //                 const nameParts = product.productName.split(",");
  //                 const amount =
  //                   nameParts.length > 1 ? nameParts.pop().trim() : "";
  //                 const cleanName = nameParts.join(",").trim();

  //                 return (
  //                   <div key={product._id} className="product-card">
  //                     <div className="image-container">
  //                       {product.imageUrl ? (
  //                         <img
  //                           src={product.imageUrl}
  //                           alt={product.productName}
  //                         />
  //                       ) : (
  //                         <div className="placeholder">No Image</div>
  //                       )}
  //                     </div>
  //                     <div className="product-details">
  //                       <h3 className="h3-ivy">{product.brand}</h3>
  //                       <h3>{cleanName}</h3>
  //                       <h3 className="h3-neue-light">{amount}</h3>
  //                       <div className="tag-container">
  //                         {product.usageType && (
  //                           <span className="tag tag-usage">
  //                             {product.usageType}
  //                           </span>
  //                         )}
  //                         {product.category && (
  //                           <span className="tag tag-category">
  //                             {product.category}
  //                           </span>
  //                         )}
  //                       </div>
  //                       <div className="button-group">
  //                         <Link to={`/products/${product._id}`}>
  //                           <button>See Details</button>
  //                         </Link>
  //                       </div>

  //                       {user ? (
  //                         <button
  //                           className={`heart-button ${
  //                             savedProductIDs.includes(product._id)
  //                               ? "saved"
  //                               : ""
  //                           }`}
  //                           onClick={() => handleRemoveProducts(product._id)}
  //                         >
  //                           <img
  //                             src={
  //                               savedProductIDs.includes(product._id)
  //                                 ? filledHeart
  //                                 : heartSVG
  //                             }
  //                             alt="Favourite"
  //                           />
  //                         </button>
  //                       ) : (
  //                         <p style={{ fontStyle: "italic", color: "#888" }}>
  //                           Login to save products
  //                         </p>
  //                       )}

  //                       {/* <button
  //                         onClick={() => handleRemoveProducts(product._id)}
  //                       >
  //                         Remove from Favourites
  //                       </button> */}
  //                     </div>
  //                   </div>
  //                 );
  //               })}
  //             </div>
  //           ) : (
  //             <p>You haven't saved any products yet.</p>
  //           )}

  //           {visibleCount < savedProducts.length && (
  //             <button onClick={() => setVisibleCount((prev) => prev + 30)}>
  //               See More
  //             </button>
  //           )}
  //         </section>

  //         <section className="section white-70">
  //           <h2 className="h2-ivy">Saved Ingredients</h2>

  //           {savedIngredient.length > 0 ? (
  //             <div className="product-grid">
  //               {savedIngredient.map((ingredient) => (
  //                 <div key={ingredient._id} className="product-card">
  //                   <div className="product-details">
  //                     <h3 className="h3-ivy">{ingredient.name}</h3>

  //                     <Link to={`/ingredients/${ingredient._id}`}>
  //                       <button>See Details</button>
  //                     </Link>

  //                     {user ? (
  //                       <button
  //                         className={`heart-button ${
  //                           savedIngredientIDs.includes(ingredient._id)
  //                             ? "saved"
  //                             : ""
  //                         }`}
  //                         onClick={() => handleRemoveIngredient(ingredient._id)}
  //                       >
  //                         <img
  //                           src={
  //                             savedIngredientIDs.includes(ingredient._id)
  //                               ? filledHeart
  //                               : heartSVG
  //                           }
  //                           alt="Favourite"
  //                         />
  //                       </button>
  //                     ) : (
  //                       <p style={{ fontStyle: "italic", color: "#888" }}>
  //                         Login to save ingredients
  //                       </p>
  //                     )}

  //                     {/* <button
  //                       onClick={() => handleRemoveIngredient(ingredient._id)}
  //                     >
  //                       Remove from Favourites
  //                     </button> */}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           ) : (
  //             <p>You haven't saved any ingredients yet.</p>
  //           )}
  //         </section>
  //       </div>
  //     </div>
  //   </div>
  // );

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
                        : heartSVG
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
                        : heartSVG
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
