import { useState } from "react";
import "./App.css";

function DashboardPreview() {
  const [allProducts, setAllProducts] = useState([]); // store everything for filtering

  // search logic
  const filteredProducts = allProducts
    .filter((product) => {
      return (product.productName || "").toLowerCase();
      // .includes(searchTerm.toLowerCase());
    })
    .slice(0, 10); // Show only top 10 (5 per row)

  // helper function to clean image URLs from Google Search redirects
  function getCleanImageUrl(url) {
    if (!url) return null;
    if (url.includes("search?q=")) {
      try {
        const directUrl = url.split("search?q=")[1];
        return decodeURIComponent(directUrl);
      } catch (e) {
        return url;
      }
    }
    return url;
  }

  return (
    <div>
      <h2 className="loginTitle">PLANTS COLLECTION - PREVIEW</h2>

      <div className="productGrid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product._id} className="plant-card">
              <div
                className="image-container"
                // style={styles/.cardImageContainer}
              >
                {product.img_url ? (
                  <img
                    src={getCleanImageUrl(product.img_url)}
                    alt={product.common_name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/200?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="placeholder">No Image</div>
                )}
              </div>
              <div className="card-details">
                <h3 className="cardTitle">{product.productName}</h3>
                <p className="cardFamily">
                  <small>
                    <strong>{product.brand}</strong>
                  </small>
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="noResults">
            <p>No plants match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPreview;
