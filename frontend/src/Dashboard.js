import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";
import { FaHeart } from "react-icons/fa";

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

  const { token, user } = useContext(AuthContext);

  const [savedProductIDs, setSavedProductIDs] = useState([]);

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

  const fetchProducts = async (skip, limit) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/products?skip=${skip}&limit=${limit}`,
      );
      const data = await res.json();
      // setProducts((prev) => [...prev, ...data]); // add to existing products
      setProducts((prev) => {
        const newIds = new Set(prev.map((p) => p._id));
        const filteredNew = data.filter((p) => !newIds.has(p._id));
        return [...prev, ...filteredNew];
      });
    } catch (err) {
      console.error(err);
    }
  };

  // See More handler
  const handleSeeMore = () => {
    fetchProducts(products.length, 30); // fetch next 30 items
    setVisibleCount((prev) => prev + 30);
  };

  // Extract unique brands for the dropdown
  const uniqueBrands = [...new Set(products.map((product) => product.brand))];

  // Filter products based on search term and selected brand
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

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
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

  const saveProduct = async (id) => {
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

      // Update local state immediately
      setSavedProducts((prev) => [...prev, id]);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const removeFromFavourites = async (productId) => {
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
          body: JSON.stringify({ productId }), // just the product ID
        },
      );

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg);
      }

      // remove the product locally from state so UI updates immediately
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p._id !== productId),
      );

      alert("Removed from favourites!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

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
    <div className="page-container">
      <header className="main-header">
        <div>{user && <h2>Welcome back, {user.username}!</h2>}</div>
      </header>

      <div className="content-wrapper">
        <div className="left-panel">
          <div className="filters">
            <h3 className="h3-ivy">Filter</h3>
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
              />

              <label>Usage Type</label>
              <input
                name="usageType"
                value={formData.usageType}
                onChange={handleChange}
              />

              <label>Category</label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
              />

              <label>Ingredients</label>
              <input
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
              />

              <button type="submit">Add Product</button>

              <hr />

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
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </form>
          </div>
        </div>

        <div className="right-panel">
          <div className="products-wrapper">
            <div className="product-grid">
              {filteredProducts.slice(0, visibleCount).map((product) => {
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

                        {savedProductIDs.includes(product._id) ? (
                          <button
                            onClick={() => handleRemoveProduct(product._id)}
                          >
                            Remove from Favourites
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSaveProduct(product._id)}
                          >
                            Save to Favourites
                          </button>
                        )}
                      </div>

                      {/* <button
                          className="heart-button"
                          onClick={() => saveProduct(product._id)}
                        >
                          <FaHeart />
                        </button> */}
                      {/* </div> */}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BUTTON OUTSIDE GRID */}
            {products.length >= visibleCount && (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <button
                  onClick={handleSeeMore}
                  style={{ padding: "10px 20px", cursor: "pointer" }}
                >
                  See More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
