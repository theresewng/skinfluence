import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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

  return (
    <div>
      <h1>{product.brand}</h1>
      <h2>{product.productName}</h2>

      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.productName} width="300" />
      )}

      <p>
        <strong>Category:</strong> {product.category}
      </p>
      <p>
        <strong>Usage Type:</strong> {product.usageType}
      </p>
      <p>
        <strong>Ingredients:</strong> {product.ingredients}
      </p>
    </div>
  );
}

export default ProductDetails;
