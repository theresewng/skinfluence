import { useEffect, useState } from "react";
import "./App.css";

function PreviewProducts() {
  // Stores all products fetched from backend
  const [allProducts, setAllProducts] = useState([]);

  // Search input state for filtering products by name
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products once when component mounts
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        }
      })
      .catch((err) => console.error("Error fetching public products:", err));
  }, []);

  // Filter products based on search input (case-insensitive match on productName)
  const filteredProducts = allProducts.filter((product) =>
    (product.productName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  // Limit displayed products to max 10
  const productsToShow = searchTerm
    ? filteredProducts.slice(0, 10)
    : filteredProducts.slice(0, 10);
  return (
    <div className="previewContainer">
      <h2 className="previewTitle">Preview Products:</h2>

      <div className="searchRow">
        <div className="searchInputGroup">
          <label className="searchLabel">Search for a Product</label>

          <input
            type="text"
            placeholder="Search a Product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="searchInput"
          />

          <button onClick={() => setSearchTerm("")} className="clearBtn">
            Clear
          </button>
        </div>
      </div>

      <div className="product-grid">
        {productsToShow.length > 0 ? (
          productsToShow.map((product) => {
           // Split product name into main name + amount (if formatted like "Name, Size")
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

                <div className="product-details">
                  <h3 className="h3-ivy">{product.brand}</h3>
                  <h3>{cleanName}</h3>

                  <h3 className="h3-neue-light">{amount}</h3>

                  <div className="tag-container">
                    {product.usageType && (
                      <span className="tag tag-usage">{product.usageType}</span>
                    )}
                    {product.category && (
                      <span className="tag tag-category">
                        {product.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Empty state when no products match search
          <div className="noResults">
            <p>No plants match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreviewProducts;
