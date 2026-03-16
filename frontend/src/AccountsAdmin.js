import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";

function Accounts() {
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

  const { token, user } = useContext(AuthContext);

  // Load products from backend
  // Initial fetch
  useEffect(() => {
    fetchProducts(0, 30);
  }, []);

  const fetchProducts = async (skip, limit) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/products?skip=${skip}&limit=${limit}`,
      );
      const data = await res.json();
      setProducts((prev) => [...prev, ...data]); // append to existing products
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

  const saveProduct = async (id) => {
    try {
      // Send POST request to backend to save product to user's favourites
      const response = await fetch(
        "http://localhost:5000/api/auth/save-product",
        {
          method: "POST",
          headers: {
            // Attach content type and token
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ productId: id }), // send the product ID in the body
        },
      );

      if (!response.ok) throw new Error("Failed to save product");

      alert("Product saved to favourites!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="page-container bkgd-purple">
      <header
        className="main-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Accounts</h2>
      </header>

      <div className="content-wrapper">
        <div className="left-panel">
          <div className="card form-card">
            <h3 className="h3-ivy">Search Accounts</h3>
            <form onSubmit={handleSubmit}>
              <label>Username</label>
              <br />
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
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
                    <div className="card-details">
                      <h3 className="h3-ivy">{product.brand}</h3>
                      <h3>{cleanName}</h3>
                      {amount && <p>{amount}</p>}
                      <p>
                        <strong>Usage Type:</strong> {product.usageType}
                      </p>
                      <p>
                        <strong>Category:</strong> {product.category}
                      </p>
                      <Link to={`/products/${product._id}`}>
                        <button>See Details</button>
                      </Link>
                      <button onClick={() => saveProduct(product._id)}>
                        Save to Favourites
                      </button>
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

export default Accounts;
