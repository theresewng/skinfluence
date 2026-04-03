import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import Comments from "./CommentsComponent";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) return <p>Loading...</p>;

  // split name and amount just like in Dashboard
  const nameParts = product.productName.split(",");
  const amount = nameParts.length > 1 ? nameParts.pop().trim() : "";
  const cleanName = nameParts.join(",").trim();

  function toggleSection(section) {
    setOpenSection(openSection === section ? null : section);
  }

  return (
    <div className="page-container bkgd-blue">
      <div className="product-section">
        <div className="info-content-wrapper">
          <div className="left-panel">
            <div className="image-container-2">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.productName} />
              ) : (
                <div className="placeholder">No Image</div>
              )}
            </div>
          </div>

          <div>
            <h3 className="h3-ivy">{product.brand}</h3>
            <h3 className="h3-neue">{cleanName}</h3>
            <h3 className="h3-neue-light">{amount}</h3>
            <div className="tag-container">
              {product.usageType && (
                <span className="tag tag-usage">{product.usageType}</span>
              )}
              {product.category && (
                <span className="tag tag-category">{product.category}</span>
              )}
            </div>
            <div className="accordion">
              <div className="accordion-item">
                <button
                  className="accordion-header"
                  onClick={() => toggleSection("ingredients")}
                >
                  <span>Ingredients</span>
                  <span className="accordion-icon">
                    {openSection === "ingredients" ? "−" : "+"}
                  </span>
                </button>

                {openSection === "ingredients" && (
                  <div className="accordion-body">
                    {product.ingredients || "No ingredients listed."}
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => toggleSection("comments")}
              >
                Comments
              </button>
              {openSection === "comments" && (
                <div className="accordion-body">
                  {product._id ? (
                    <Comments productId={product._id} />
                  ) : (
                    <p>No comments available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
