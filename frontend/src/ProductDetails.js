import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import Comments from "./CommentsComponent";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [ingredients, setIngredients] = useState({}); // key: ingredient name, value: ingredient object

  // Fetch all ingredients
  useEffect(() => {
    fetch("http://localhost:5000/api/ingredients")
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        data.forEach((ing) => {
          map[ing.name.toLowerCase()] = ing;
        });
        setIngredients(map);
      })
      .catch((err) => console.error("Error fetching ingredients:", err));
  }, []);

  // Fetch product details
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

  const nameParts = product.productName.split(",");
  const amount = nameParts.length > 1 ? nameParts.pop().trim() : "";
  const cleanName = nameParts.join(",").trim();
  const ingredientList = product.ingredients
    ? product.ingredients.split(",").map((i) => i.trim())
    : [];

  function toggleSection(section) {
    setOpenSection(openSection === section ? null : section);
  }

  // Normalize: lowercase, remove parentheses, special chars
  // Normalize: lowercase, replace parentheses with spaces, remove special chars
  function normalizeIngredient(name) {
    return name
      .toLowerCase()
      .replace(/[()]/g, " ") // Keeps "jojoba" instead of deleting it
      .replace(/[^a-z0-9\s]/g, "")
      .trim();
  }

  function findMatchedIngredient(name) {
    const productNorm = normalizeIngredient(name);
    const productWords = productNorm.split(/\s+/).filter(Boolean);

    // Added a few more common cosmetic generics to help you out
    const genericWords = [
      "oil",
      "seed",
      "extract",
      "leaf",
      "water",
      "powder",
      "butter",
      "root",
      "juice",
      "acid",
    ];

    // Fallback: If stripping generics leaves an empty array (e.g., the ingredient is just "Water"), keep the original words
    let productFiltered = productWords.filter((w) => !genericWords.includes(w));
    if (productFiltered.length === 0) productFiltered = productWords;

    // Helper function to check if one array of words is completely contained within another
    const isSubset = (subset, superset) =>
      subset.length > 0 && subset.every((w) => superset.includes(w));

    return Object.values(ingredients).find((ing) => {
      const ingNorm = normalizeIngredient(ing.name);
      const ingWords = ingNorm.split(/\s+/).filter(Boolean);

      let ingFiltered = ingWords.filter((w) => !genericWords.includes(w));
      if (ingFiltered.length === 0) ingFiltered = ingWords;

      // Match if the DB ingredient is contained within the product name OR vice versa
      if (
        isSubset(ingFiltered, productFiltered) ||
        isSubset(productFiltered, ingFiltered)
      ) {
        return true;
      }

      // Check aliases using the same logic
      if (ing.aliases) {
        return ing.aliases.some((alias) => {
          const aliasNorm = normalizeIngredient(alias);
          const aliasWords = aliasNorm.split(/\s+/).filter(Boolean);

          let aliasFiltered = aliasWords.filter(
            (w) => !genericWords.includes(w),
          );
          if (aliasFiltered.length === 0) aliasFiltered = aliasWords;

          return (
            isSubset(aliasFiltered, productFiltered) ||
            isSubset(productFiltered, aliasFiltered)
          );
        });
      }

      return false;
    });
  }

  return (
    <div className="page-container bkgd-green">
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
                    {ingredientList.length === 0 && (
                      <p>No ingredients listed.</p>
                    )}
                    {ingredientList.map((ing, idx) => {
                      const matched = findMatchedIngredient(ing);
                      return (
                        <span key={idx}>
                          {matched ? (
                            <Link
                              to={`/ingredients/${matched._id}`}
                              className="ingredient-link"
                            >
                              {ing}
                            </Link>
                          ) : (
                            ing
                          )}
                          {idx < ingredientList.length - 1 ? ", " : ""}
                        </span>
                      );
                    })}
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
