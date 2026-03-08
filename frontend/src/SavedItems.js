import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";

function SavedItems() {
  const [products, setProducts] = useState([]);
  const [savedProductIDs, setSavedProductIDs] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);

  const { token, user, logout } = useContext(AuthContext);

  // Load products from backend
  useEffect(() => {
    fetch(`http://localhost:5000/api/products?limit=30&skip=0`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Fetch user's saved product IDs
  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/auth/user", {
        headers: { Authorization: token },
      })
        .then((res) => res.json())
        .then((data) => setSavedProductIDs(data.savedProductIDs || []))
        .catch((err) => console.error("Error fetching user data:", err));
    }
  }, [token]);

  // Load user data to get saved product IDs
  const savedProducts = products.filter((product) => {
    return savedProductIDs.includes(product._id);
  });

  // const handleRemove = async (id) => {
  // try {
  //   const response = await fetch(`http://localhost:5000/api/products/${id}`, {
  //     method: "DELETE",
  //     headers: { Authorization: token },
  //   });
  //   if (!response.ok) throw new Error("Failed to delete product");
  //   setProducts(products.filter((product) => product._id !== id));
  // } catch (err) {
  //   console.error(err);
  //   alert(err.message);
  // }
  // };

  return (
    <div className="page-container bkgd-yellow">
      <header
        className="main-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>{user && <h2>Welcome back, {user.username}!</h2>}</div>
        <button
          onClick={logout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#c62828",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </header>

      <div className="content-wrapper">
        <div className="left-panel">
          <div className="card white-70">
            <h3 className="h3-ivy">My Skin</h3>
            <button>Edit Skin Profile</button>
            <h4 className="h4-neue">Skin Type</h4>
            <ul>
              <li>Oily skin</li>
            </ul>
            <h4 className="h4-neue">Skin Concerns</h4>
            <ul>
              <li>Acne</li>
              <li>Hyperpigmentation</li>
            </ul>
          </div>
        </div>

        <div className="right-panel">
          <section className="section white-70">
            <h2 className="h2-ivy">Saved Products</h2>
            {savedProducts.length > 0 ? (
              <div className="product-grid">
                {savedProducts.slice(0, visibleCount).map((product) => {
                  const nameParts = product.productName.split(",");
                  const amount =
                    nameParts.length > 1 ? nameParts.pop().trim() : "";
                  const cleanName = nameParts.join(",").trim();

                  return (
                    <div key={product._id} className="product-card">
                      <div className="image-container">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.productName}
                          />
                        ) : (
                          <div className="placeholder">No Image</div>
                        )}
                      </div>
                      <div className="card-details">
                        <h3 className="h3-ivy">{product.brand}</h3>
                        <h3 className="h3-neue">{cleanName}</h3>
                        {amount && <p className="h3-neue-light">{amount}</p>}
                        <p className="h3-ivy">
                          <strong>Usage Type:</strong> {product.usageType}
                        </p>
                        <p className="h3-ivy">
                          <strong>Category:</strong> {product.category}
                        </p>
                        <Link to={`/products/${product._id}`}>
                          <button>See Details</button>
                        </Link>
                        {/* <button onClick={() => handleRemove(product._id)}>
                          Remove from Favourites
                        </button> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>You haven't saved any products yet.</p>
            )}

            {visibleCount < savedProducts.length && (
              <button onClick={() => setVisibleCount((prev) => prev + 30)}>
                See More
              </button>
            )}
          </section>
          <section className="section white-70">
            <h2 className="h2-ivy">Saved Ingredients</h2>
            <p>Feature coming soon!</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default SavedItems;
