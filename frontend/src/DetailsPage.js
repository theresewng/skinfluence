import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function DetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!product) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>{product.productName}</h1>

      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.productName} />
      )}

      <p>
        <strong>Brand:</strong> {product.brand}
      </p>
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

export default DetailsPage;
