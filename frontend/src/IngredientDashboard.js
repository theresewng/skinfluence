import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";
import blankHeart from "../src/assets/img/blankHeart.svg";
import filledHeart from "../src/assets/img/filledHeart.svg";
import hoverHeart from "../src/assets/img/hoverHeart.svg";

// Main Ingredient Dashboard component (handles listing, filtering, saving, and admin creation)
function IngredientDashboard() {
    // Stores all ingredients loaded from backend (supports pagination)
  const [ingredients, setIngredients] = useState([]);

    // Controls how many ingredients are shown before "See More" is needed
  const [visibleCount, setVisibleCount] = useState(30);

    // Form state for admin to create a new ingredient
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    short_description: "",
    what_is_it: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [savedIngredients, setSavedIngredients] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [allCategories, setAllCategories] = useState([]);
  const [hoveredIngredientId, setHoveredIngredientId] = useState(null);

  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://localhost:5000/api/ingredients/categories/all")
      .then((res) => res.json())
      .then((data) => setAllCategories(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${token.trim()}` },
      })
        .then((res) => res.json())
        .then((data) => setSavedIngredients(data.savedIngredientIDs || []))
        .catch((err) => console.error("Error fetching user data:", err));
    }
  }, [token]);

  // Initial ingredient load (first page)
  useEffect(() => {
    fetchIngredients(0, 30);
  }, []);


  // Fetch ingredients from backend with pagination + optional filters
  const fetchIngredients = async (skip, limit, search = "", category = "") => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/ingredients?skip=${skip}&limit=${limit}&search=${encodeURIComponent(
          search,
        )}&category=${encodeURIComponent(category)}`,
      );
      const data = await res.json();
      // If returned items are less than limit, no more data exists
      setHasMore(data.length === limit);

      // If first page, replace data; otherwise append without duplicates
      setIngredients((prev) => {
        if (skip === 0) return data;
        const existingIds = new Set(prev.map((i) => i._id));
        const newItems = data.filter((i) => !existingIds.has(i._id));
        return [...prev, ...newItems];
      });
    } catch (err) {
      console.error("Error fetching ingredients:", err);
    }
  };

  // Debounced search + category filter (prevents excessive API calls)
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchIngredients(0, 30, searchTerm, selectedCategory);
      setVisibleCount(30);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, selectedCategory]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit new ingredient (admin only)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, category, short_description, what_is_it } = formData;
    if (!name || !category || !short_description || !what_is_it) {
      alert("Please fill out all fields before submitting.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to add ingredient");

      const newIngredient = await response.json();
      setIngredients([...ingredients, newIngredient]);
      setFormData({
        name: "",
        category: "",
        short_description: "",
        what_is_it: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleSeeMore = () => {
    fetchIngredients(ingredients.length, 30, searchTerm, selectedCategory);
    setVisibleCount((prev) => prev + 30);
  };

  // Toggle save/unsave ingredient for user
  const toggleFavouriteIngredient = async (ingredientId) => {
    if (!token) return alert("You are not logged in!");
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

  // Filters ingredients based on search + category
  const filteredIngredients = ingredients.filter((ingredient) => {
    const term = searchTerm.toLowerCase();
    const name = ingredient.name?.toLowerCase() || "";
    const desc = ingredient.short_description?.toLowerCase() || "";
    const matchesSearch = name.includes(term) || desc.includes(term);
    const matchesCategory = selectedCategory
      ? ingredient.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  // Controls pagination vs search behavior
  const displayedIngredients = searchTerm
    ? filteredIngredients
    : filteredIngredients.slice(0, visibleCount);

  return (
    <div className="page-container bkgd-blue">
      <header
        className="main-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        {user ? (
          <h2 style={{ margin: 0 }}>Welcome back, {user.username}!</h2>
        ) : (
          <>
            <h2 style={{ margin: 0 }}>
              Login to save products and leave comments!
            </h2>
            <Link to="/login">
              <button
                className="login-btn"
                style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
              >
                Login
              </button>
            </Link>
          </>
        )}
      </header>

      <div className="content-wrapper">
        {/* LEFT PANEL */}
        <div className="left-panel">
          {user?.role === "admin" && (
            <div className="filters">
              <h3 className="h3-ivy">Admin Actions</h3>
              <form onSubmit={handleSubmit}>
                <h4>Add New Ingredient</h4>
                <label>Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <label>Category</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
                <label>Short Description</label>
                <input
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  required
                />
                <label>What is it?</label>
                <input
                  name="what_is_it"
                  value={formData.what_is_it}
                  onChange={handleChange}
                  required
                />
                <button type="submit">Add Ingredient</button>
              </form>
            </div>
          )}

          <div className="filters">
            <h4>Filter Ingredients</h4>
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="products-wrapper">
            <div className="product-grid">
              {displayedIngredients.length === 0 ? (
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#888",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  No ingredients found.
                </p>
              ) : (
                displayedIngredients.map((ingredient) => (
                  <div key={ingredient._id} className="product-card">
                    <div className="product-details">
                      <h3 className="h3-ivy">{ingredient.name}</h3>
                      <p>
                        <strong>What is it:</strong> {ingredient.what_is_it}
                      </p>
                      <div className="button-group">
                        <Link to={`/ingredients/${ingredient._id}`}>
                          <button>See Details</button>
                        </Link>
                        {/* {!user && (
                          <p style={{ fontStyle: "italic", color: "#888" }}>
                            Login to save
                          </p>
                        )} */}
                        {user?.role === "user" && (
                          <button
                            className={`heart-button ${savedIngredients.includes(ingredient._id) ? "saved" : ""}`}
                            onClick={() =>
                              toggleFavouriteIngredient(ingredient._id)
                            }
                            onMouseEnter={() =>
                              setHoveredIngredientId(ingredient._id)
                            }
                            onMouseLeave={() => setHoveredIngredientId(null)}
                          >
                            <img
                              src={
                                hoveredIngredientId === ingredient._id
                                  ? hoverHeart
                                  : savedIngredients.includes(ingredient._id)
                                    ? filledHeart
                                    : blankHeart
                              }
                              alt="Favourite"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SEE MORE BUTTON - Centered relative to right-panel */}
          {!searchTerm && hasMore && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                padding: "40px 0", // Added padding for better spacing
              }}
            >
              <button
                onClick={handleSeeMore}
                style={{ padding: "10px 25px", cursor: "pointer" }}
              >
                See More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IngredientDashboard;
