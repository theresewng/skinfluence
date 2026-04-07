import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";
import heartSVG from "../src/assets/img/heart.svg";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    usageType: "",
    category: "",
    ingredients: "",
    imageUrl: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [savedProducts, setSavedProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [savedProductIDs, setSavedProductIDs] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/brands/all")
      .then((res) => res.json())
      .then((data) => setAllBrands(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${token.trim()}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setSavedProductIDs(data.savedProductIDs || []);
        })
        .catch((err) => console.error("Error fetching user data:", err));
    }
  }, [token]);

  // Load products from backend
  // Initial fetch
  useEffect(() => {
    fetchProducts(0, 30);
  }, []);

  useEffect(() => {
    if (user && user.savedProductIDs) {
      setSavedProducts(user.savedProductIDs);
    }
  }, [user]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts(0, 30, searchTerm, selectedBrand);
      setVisibleCount(30);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, selectedBrand]);

  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />;

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    const name = product.productName?.toLowerCase() || "";
    const brand = product.brand?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";
    const matchesSearch =
      name.includes(term) || brand.includes(term) || category.includes(term);
    const matchesBrand = selectedBrand ? product.brand === selectedBrand : true;
    return matchesSearch && matchesBrand;
  });

  const fetchProducts = async (skip, limit, search = "", brand = "") => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/products?skip=${skip}&limit=${limit}&search=${encodeURIComponent(search)}&brand=${encodeURIComponent(brand)}`,
      );

      const data = await res.json();

      setHasMore(data.length === limit);

      setProducts((prev) => {
        if (skip === 0) return data;

        const existingIds = new Set(prev.map((p) => p._id));
        const newItems = data.filter((p) => !existingIds.has(p._id));

        return [...prev, ...newItems];
      });
    } catch (err) {
      console.error(err);
    }
  };

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSeeMore = () => {
    fetchProducts(products.length, 30, searchTerm, selectedBrand);
    setVisibleCount((prev) => prev + 30);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const { productName, brand, usageType, category, ingredients } = formData;

    if (!productName || !brand || !usageType || !category || !ingredients) {
      alert("Please fill out all fields before submitting.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify(formData), // send the product info, not 'id'
      });

      if (!response.ok) throw new Error("Failed to add product");

      const newProduct = await response.json();
      setProducts([...products, newProduct]);

      setFormData({
        productName: "",
        brand: "",
        usageType: "",
        category: "",
        ingredients: "",
        imageUrl: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  const handleSaveProduct = async (id) => {
    if (!token) return alert("You are not logged in!");
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/save-product",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.trim()}`,
          },
          body: JSON.stringify({ productId: id }),
        },
      );
      if (!response.ok) throw new Error(await response.text());

      // update local state
      setSavedProductIDs((prev) => [...prev, id]);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleRemoveProduct = async (id) => {
    if (!token) return alert("You are not logged in!");
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/remove-product",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.trim()}`,
          },
          body: JSON.stringify({ productId: id }),
        },
      );
      if (!response.ok) throw new Error(await response.text());

      // update local state
      setSavedProductIDs((prev) => prev.filter((pid) => pid !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="page-container bkgd-green">
      <header
        className="main-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        {user ? (
          <h2>Welcome back, {user.username}!</h2>
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            <h2>Please log in to leave a comment.</h2>
            <Link to="/login">
              <button
                className="login-btn"
                style={{
                  marginLeft: "1rem",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </Link>
          </div>
        )}
      </header>

      <div className="content-wrapper">
        <div className="left-panel">
          <div className="filters">
            <h3 className="h3-ivy">Filter</h3>

            {/* ✅ ADMIN ONLY SECTION */}
            {user?.role === "admin" && (
              <>
                <form onSubmit={handleSubmit}>
                  <h4>Add New Product</h4>

                  <label>Product Name</label>
                  <input
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    required
                  />

                  <label>Brand</label>
                  <input
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  />

                  <label>Usage Type</label>
                  <input
                    name="usageType"
                    value={formData.usageType}
                    onChange={handleChange}
                    required
                  />

                  <label>Category</label>
                  <input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  />

                  <label>Ingredients</label>
                  <input
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleChange}
                    required
                  />

                  <button type="submit">Add Product</button>
                </form>

                <hr />
              </>
            )}

            {/* ✅ ALWAYS VISIBLE */}
            <h4>Filter Products</h4>

            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name, brand, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <label>Filter by Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">All Brands</option>
              {allBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="right-panel">
          <div className="products-wrapper">
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const nameParts = product.productName.split(",");
                const amount =
                  nameParts.length > 1 ? nameParts.pop().trim() : "";
                const cleanName = nameParts.join(",").trim();

                return (
                  <div key={product._id} className="product-card">
                    <div className="image-container">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.productName} />
                      ) : (
                        <div className="placeholder">No Image</div>
                      )}
                    </div>
                    <div className="product-details">
                      <h3 className="h3-ivy">{product.brand}</h3>
                      <h3>{cleanName}</h3>
                      <h3 className="h3-neue-light">{amount}</h3>
                      <div className="tag-container">
                        {product.usageType && (
                          <span className="tag tag-usage">
                            {product.usageType}
                          </span>
                        )}
                        {product.category && (
                          <span className="tag tag-category">
                            {product.category}
                          </span>
                        )}
                      </div>

                      <div className="button-group">
                        <Link to={`/products/${product._id}`}>
                          <button>See Details</button>
                        </Link>

                        {/* Only show save/remove buttons if user is logged in */}
                        {user ? (
                          savedProductIDs.includes(product._id) ? (
                            <button
                              onClick={() => handleRemoveProduct(product._id)}
                            >
                              Remove from Favourites
                            </button>
                          ) : (
                            <button
                              className="heart-button"
                              onClick={() => handleSaveProduct(product._id)}
                            >
                              <img src={heartSVG} alt="Save Ingredient" />
                            </button>
                          )
                        ) : (
                          <p style={{ fontStyle: "italic", color: "#888" }}>
                            Login to save products
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <button onClick={handleSeeMore}>See More</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
