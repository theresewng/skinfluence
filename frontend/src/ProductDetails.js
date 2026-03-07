import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";

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
    <div className="productBackground">
      <div className="info-content-wrapper">
        <div className="left-panel">
          <div className="image-container">
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
          {amount && <p className="h3-neue-light">{amount}</p>}
          <p className="h3-ivy">
            <strong>Usage Type:</strong> {product.usageType}
          </p>
          <p className="h3-ivy">
            <strong>Category:</strong> {product.category}
          </p>

          <div className="accordion">
            <div className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => toggleSection("ingredients")}
              >
                Ingredients
              </button>

              {openSection === "ingredients" && (
                <div className="accordion-body">
                  {product.ingredients || "No ingredients listed."}
                </div>
              )}
            </div>

            <div className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => toggleSection("details")}
              >
                Product Details
              </button>

              {openSection === "details" && (
                <div className="accordion-body">
                  <p>
                    <strong>Usage Type:</strong> {product.usageType}
                  </p>
                  <p>
                    <strong>Category:</strong> {product.category}
                  </p>
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
