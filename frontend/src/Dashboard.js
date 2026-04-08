import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";
import blankHeart from "../src/assets/img/blankHeart.svg";
import filledHeart from "../src/assets/img/filledHeart.svg";
import hoverHeart from "../src/assets/img/hoverHeart.svg";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [hasMore, setHasMore] = useState(true);
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    usageType: "",
    category: "",
    ingredients: "",
    imageUrl: "",
  });

  // For saved products
  const [savedProducts, setSavedProducts] = useState([]);
  const [savedProductIDs, setSavedProductIDs] = useState([]);
  const [hoveredProductId, setHoveredProductId] = useState(null); // For hover state of heart icon

  // For filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedUsageType, setSelectedUsageType] = useState("");
  const [allBrands, setAllBrands] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [allUsageTypes, setAllUsageTypes] = useState([]);

  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://localhost:5000/api/products/brands/all")
      .then((res) => res.json())
      .then((data) => setAllBrands(data))
      .catch((err) => console.error(err));
    fetch("http://localhost:5000/api/products/categories/all")
      .then((res) => res.json())
      .then((data) => setAllCategories(data))
      .catch((err) => console.error(err));
    fetch("http://localhost:5000/api/products/usage-types/all")
      .then((res) => res.json())
      .then((data) => setAllUsageTypes(data))
      .catch((err) => console.error(err));
  }, [searchTerm, selectedBrand, selectedCategory, selectedUsageType]);

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
      fetchProducts(
        0,
        30,
        searchTerm,
        selectedBrand,
        selectedCategory,
        selectedUsageType,
      );
      setVisibleCount(30);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, selectedBrand, selectedCategory, selectedUsageType]);

  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />;

  const filteredProducts = products.filter((product) => {
    // Convert everything to lowercase to make the search case-insensitive
    const term = searchTerm.toLowerCase();
    const name = product.productName?.toLowerCase() || "";
    const brand = product.brand?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";
    const usageType = product.usageType?.toLowerCase() || "";

    // Check if product matches search term
    const matchesSearch =
      name.includes(term) ||
      brand.includes(term) ||
      category.includes(term) ||
      usageType.includes(term);

    // Backend already filters by brand, category, usageType
    return matchesSearch;
  });

  const fetchProducts = async (
    skip,
    limit,
    search = "",
    brand = "",
    category = "",
    usageType = "",
  ) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/products?skip=${skip}&limit=${limit}&search=${encodeURIComponent(search)}&brand=${encodeURIComponent(brand)}&category=${encodeURIComponent(category)}&usageType=${encodeURIComponent(usageType)}`,
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
    fetchProducts(
      products.length,
      30,
      searchTerm,
      selectedBrand,
      selectedCategory,
      selectedUsageType,
    );
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
      alert("Removed from favourites");
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
          justifyContent: "space-between", // pushes items to edges
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        {user ? (
          <h2 style={{ margin: 0 }}>Welcome back, {user.username}!</h2>
        ) : (
          <>
            <h2 style={{ margin: 0 }}>
              Login to save products and leave comments!
            </h2>

            <Link to="/login">
              <button
                className="login-btn"
                style={{
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </Link>
          </>
        )}
      </header>

      <div className="content-wrapper">
        <div className="left-panel">
          {/* Add a New Product — Only visible to admins */}

          {user?.role === "admin" && (
            <>
              <div className="filters">
                <h3 className="h3">Add a New Product</h3>
                <form onSubmit={handleSubmit}>
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
              </div>
            </>
          )}

          {/* Filtering — Visible to all users */}
          <div className="filters">
            <h3 className="h3">Filter Products</h3>
            <form>
              <label>Search</label>
              <input
                type="text"
                placeholder="Search by name, brand, category…"
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

              <label>Filter by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {allCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <label>Filter by Usage Type</label>
              <select
                value={selectedUsageType}
                onChange={(e) => setSelectedUsageType(e.target.value)}
              >
                <option value="">All Usage Types</option>
                {allUsageTypes.map((usageType) => (
                  <option key={usageType} value={usageType}>
                    {usageType}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedBrand("");
                  setSelectedCategory("");
                  setSelectedUsageType("");
                }}
              >
                Clear Filters
              </button>
            </form>
          </div>
        </div>

        <div className="right-panel">
          <div className="products-wrapper">
            <div className="product-grid">
              {filteredProducts.slice(0, visibleCount).length === 0 ? (
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#888",
                    minWidth: "100 vw",
                    whiteSpace: "nowrap",
                  }}
                >
                  No products found. Try adjusting your search or filters.
                </p>
              ) : (
                filteredProducts.slice(0, visibleCount).map((product) => {
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

                          {/* If user is logged in as a regular user */}
                          {user?.role === "user" && (
                            <button
                              className={`heart-button ${
                                savedProductIDs.includes(product._id)
                                  ? "saved"
                                  : ""
                              }`}
                              onClick={() =>
                                savedProductIDs.includes(product._id)
                                  ? handleRemoveProduct(product._id)
                                  : handleSaveProduct(product._id)
                              }
                              onMouseEnter={() =>
                                setHoveredProductId(product._id)
                              }
                              onMouseLeave={() => setHoveredProductId(null)}
                            >
                              <img
                                src={
                                  hoveredProductId === product._id
                                    ? hoverHeart
                                    : savedProductIDs.includes(product._id)
                                      ? filledHeart
                                      : blankHeart
                                }
                                alt="Favourite"
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
