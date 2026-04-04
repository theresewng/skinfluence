import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";
import heartSVG from "../src/assets/img/heart.svg";
import filledHeart from "../src/assets/img/filledHeart.svg";

function IngredientDashboard() {
  const [ingredients, setIngredients] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedIngredients, setSavedIngredients] = useState([]);

  const { token, user } = useContext(AuthContext);

  // Fetch user saved ingredients on login
  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${token.trim()}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setSavedIngredients(data.savedIngredientIDs || []);
        })
        .catch((err) => console.error("Error fetching user data:", err));
    }
  }, [token]);

  // Fetch ingredients from backend
  useEffect(() => {
    fetchIngredients(0, 30);
  }, []);

  const fetchIngredients = async (skip, limit) => {
    try {
      const res = await fetch(`http://localhost:5000/api/ingredients`);
      const data = await res.json();

      setIngredients((prev) => {
        const existingIds = new Set(prev.map((i) => i._id));
        const newIngredients = data.filter((i) => !existingIds.has(i._id));
        return [...prev, ...newIngredients];
      });
    } catch (err) {
      console.error("Error fetching ingredients:", err);
    }
  };

  const handleSeeMore = () => {
    fetchIngredients(ingredients.length, 30);
    setVisibleCount((prev) => prev + 30);
  };

  // Filter ingredients based on search term
  const filteredIngredients = ingredients.filter((ingredient) => {
    const term = searchTerm.toLowerCase();
    const name = ingredient.name?.toLowerCase() || "";
    const description = ingredient.short_description?.toLowerCase() || "";
    return name.includes(term) || description.includes(term);
  });

  // Save or remove favourite
  const toggleFavouriteIngredient = async (ingredientId) => {
    if (!token) {
      alert("You are not logged in!");
      return;
    }

    const isSaved = savedIngredients.includes(ingredientId);

    try {
      const endpoint = isSaved ? "remove-ingredient" : "save-ingredient";

      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({ ingredientId }),
      });

      if (!res.ok) throw new Error(await res.text());

      // Update only user's saved ingredients in local state
      setSavedIngredients((prev) =>
        isSaved
          ? prev.filter((id) => id !== ingredientId)
          : [...prev, ingredientId],
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="page-container bkgd-blue">
      <header className="main-header">
        {user ? (
          <h2>Welcome back, {user.username}!</h2>
        ) : (
          <div style={{ display: "flex", alignItems: "center" }}>
            <h2>You are not logged in</h2>
            <Link to="/login">
              <button
                className="login-btn"
                style={{
                  marginLeft: "1rem",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </Link>
          </div>
        )}{" "}
      </header>

      <div className="content-wrapper">
        <div className="left-panel">
          <div className="filters">
            <h3 className="h3-ivy">Filter</h3>
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="right-panel">
          <div className="products-wrapper">
            <div className="product-grid">
              {(searchTerm
                ? filteredIngredients
                : filteredIngredients.slice(0, visibleCount)
              ).map((ingredient) => (
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

                    <div className="button-group">
                      <Link to={`/ingredients/${ingredient._id}`}>
                        <button>See Details</button>
                      </Link>

                      {user ? (
                        savedIngredients.includes(ingredient._id) ? (
                          <button
                            onClick={() =>
                              toggleFavouriteIngredient(ingredient._id)
                            }
                          >
                            Remove from Favourites
                          </button>
                        ) : (
                          <button
                            className="heart-button"
                            onClick={() =>
                              toggleFavouriteIngredient(ingredient._id)
                            }
                          >
                            <img src={heartSVG} alt="Save Ingredient" />
                          </button>
                        )
                      ) : (
                        <p style={{ fontStyle: "italic", color: "#888" }}>
                          Login to save ingredients
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!searchTerm && filteredIngredients.length >= visibleCount && (
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
