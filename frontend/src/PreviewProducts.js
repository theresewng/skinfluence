import { useEffect, useState } from "react";
import "./App.css";

function PreviewProducts() {
  const [allProducts, setAllProducts] = useState([]); // store everything for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [product, setProduct] = useState(null);

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

  // split name and amount just like in Dashboard
  const nameParts = product.productName.split(",");
  const amount = nameParts.length > 1 ? nameParts.pop().trim() : "";
  const cleanName = nameParts.join(",").trim();

  return (
    <div className="page-container bkgd-blue">
      <div>
        <h2 className="previewTitle">PLANTS COLLECTION - PREVIEW</h2>

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewProducts;
