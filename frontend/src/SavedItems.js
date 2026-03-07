import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";

function SavedItems() {
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

  const { token, user, logout } = useContext(AuthContext);

  // Load products from backend
  useEffect(() => {
    fetch(`http://localhost:5000/api/products?limit=30&skip=0`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

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
    // const matchesSearch =
    //   product.productName.toLowerCase().includes(term) ||
    //   product.brand.toLowerCase().includes(term) ||
    //   product.category.toLowerCase().includes(term);
    const matchesBrand = selectedBrand ? product.brand === selectedBrand : true;
    return matchesSearch && matchesBrand;
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/api/products?limit=30&skip=0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(formData),
        },
      );

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

  // const handleDelete = async (id) => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/products/${id}`, {
  //       method: "DELETE",
  //       headers: { Authorization: token },
  //     });
  //     if (!response.ok) throw new Error("Failed to delete product");
  //     setProducts(products.filter((product) => product._id !== id));
  //   } catch (err) {
  //     console.error(err);
  //     alert(err.message);
  //   }
  // };

  return (
    <div className="page-container">
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
          <div className="card form-card">
            <h3 className="h3-ivy">Filter</h3>
            {/* <form onSubmit={handleSubmit} className="plant-form">
              <label>Search Products</label>
              <input
                type="text"
                placeholder="Search by name, brand, or category..."
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

              <button type="submit">Add Product</button>
            </form> */}

            <form onSubmit={handleSubmit} className="plant-form">
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
          <div className="product-grid">
            {filteredProducts.slice(0, visibleCount).map((product) => {
              const nameParts = product.productName.split(",");
              const amount = nameParts.length > 1 ? nameParts.pop().trim() : "";
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
                  </div>
                </div>
              );
            })}

            {visibleCount < filteredProducts.length && (
              <button onClick={() => setVisibleCount((prev) => prev + 30)}>
                See More
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavedItems;
