import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import "./App.css";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

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

        <div className="right-panel">
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
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Who should use it</Accordion.Header>
              <Accordion.Body></Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Ingredients</Accordion.Header>
              <Accordion.Body>
                {product.ingredients
                  ? product.ingredients
                  : "No ingredients listed"}
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Community Reviews</Accordion.Header>
              <Accordion.Body></Accordion.Body>
            </Accordion.Item>
          </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
