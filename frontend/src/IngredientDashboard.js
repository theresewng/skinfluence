import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";

function IngredientDashboard() {
  const [ingredients, setIngredients] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [searchTerm, setSearchTerm] = useState("");

  const { token, user } = useContext(AuthContext);

  // Load products from backend
  // Initial fetch
  useEffect(() => {
    fetchIngredients(0, 30);
  }, []);

  const fetchIngredients = async (skip, limit) => {
    try {
      const res = await fetch("http://localhost:5000/api/ingredients");
      const data = await res.json();
      setIngredients((prev) => {
        const combined = [...prev, ...data];

        const unique = Array.from(
          new Map(combined.map((item) => [item._id, item])).values(),
        );

        return unique;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredIngredients = ingredients.filter((ingredient) => {
    const term = searchTerm.toLowerCase();
    const name = ingredient.name?.toLowerCase() || "";
    const description = ingredient.short_description?.toLowerCase() || "";
    const matchesSearch = name.includes(term) || description.includes(term);
    return matchesSearch;
  });

  // See More handler
  const handleSeeMore = () => {
    fetchIngredients(ingredients.length, 30); // fetch next 30 items
    setVisibleCount((prev) => prev + 30);
  };

  const saveIngredient = async (id) => {
    try {
      // Send POST request to backend to save ingredient to user's favourites
      const response = await fetch(
        "http://localhost:5000/api/auth/save-ingredient",
        {
          method: "POST",
          headers: {
            // Attach content type and token
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ingredientId: id }), // send the ingredient ID in the body
        },
      );

      if (!response.ok) throw new Error("Failed to save ingredient");

      alert("Ingredient saved to favourites!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      <header className="main-header">
        <div>{user && <h2>Welcome back, {user.username}!</h2>}</div>
      </header>

      <div className="content-wrapper">
        <div className="left-panel">
          <div className="filters">
            <h3 className="h3-ivy">Filter</h3>
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name, brand, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="right-panel">
          <div className="products-wrapper">
            <div className="product-grid">
              {filteredIngredients.slice(0, visibleCount).map((ingredient) => (
                <div key={ingredient._id} className="product-card">
                  <div className="product-details">
                    <h3 className="h3-ivy">{ingredient.name}</h3>

                    <h3 className="h3-neue">
                      <strong>What is it:</strong>
                    </h3>
                    <p>{ingredient.what_is_it}</p>
                    <div className="button-group">
                      <Link to={`/ingredients/${ingredient._id}`}>
                        <button>See Details</button>
                      </Link>

                      <button onClick={() => saveIngredient(ingredient._id)}>
                        Save to Favourites
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* BUTTON OUTSIDE GRID */}
            {ingredients.length >= visibleCount && (
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

export default IngredientDashboard;
