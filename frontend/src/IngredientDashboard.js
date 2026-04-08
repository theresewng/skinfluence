import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";
import blankHeart from "../src/assets/img/blankHeart.svg";
import filledHeart from "../src/assets/img/filledHeart.svg";
import hoverHeart from "../src/assets/img/hoverHeart.svg";

function IngredientDashboard() {
  const [ingredients, setIngredients] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);
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
  const [hoveredIngredientId, setHoveredIngredientId] = useState(null); // For hover state of heart icon

  const { token, user } = useContext(AuthContext);

  // Fetch all unique categories for filter dropdown
  useEffect(() => {
    fetch("http://localhost:5000/api/ingredients/categories/all")
      .then((res) => res.json())
      .then((data) => setAllCategories(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch user saved ingredients
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

  // Initial fetch
  useEffect(() => {
    fetchIngredients(0, 30);
  }, []);

  // Fetch ingredients from backend
  const fetchIngredients = async (skip, limit, search = "", category = "") => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/ingredients?skip=${skip}&limit=${limit}&search=${encodeURIComponent(
          search,
        )}&category=${encodeURIComponent(category)}`,
      );
      const data = await res.json();
      setHasMore(data.length === limit);

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

  // Refetch on search/category change
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchIngredients(0, 30, searchTerm, selectedCategory);
      setVisibleCount(30);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, selectedCategory]);

  // Admin form handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  // Filter ingredients for display
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

  return (
    <div className="page-container bkgd-blue">
      <header
        className="main-header"
        style={{
          display: "flex",
          justifyContent: "space-between", // pushes items to edges
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
                style={{
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                }}
              >
                Login
              </button>
            </Link>
          </>
        )}
      </header>

      <div className="content-wrapper">
        <div className="left-panel">
          {/* Add a New Ingredient — Only visible to admins */}

          {user?.role === "admin" && (
            <div className="filters">
              <h3 className="h3-ivy">Filter</h3>
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

          {/* Filtering — Visible to all users */}
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

        <div className="product-grid">
          {(searchTerm
            ? filteredIngredients
            : filteredIngredients.slice(0, visibleCount)
          ).length === 0 ? (
            <p
              style={{
                fontStyle: "italic",
                color: "#888",
                width: "100%",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
            >
              No ingredients found. Try adjusting your search or filters.
            </p>
          ) : (
            (searchTerm
              ? filteredIngredients
              : filteredIngredients.slice(0, visibleCount)
            ).map((ingredient) => (
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

                    {/* If no user */}
                    {!user && (
                      <p style={{ fontStyle: "italic", color: "#888" }}>
                        Login to save ingredients
                      </p>
                    )}

                    {/* If logged in */}
                    {user?.role === "user" && (
                      <button
                        className={`heart-button ${
                          savedIngredients.includes(ingredient._id)
                            ? "saved"
                            : ""
                        }`}
                        onClick={() =>
                          toggleFavouriteIngredient(
                            ingredient._id,
                            savedIngredients.includes(ingredient._id),
                          )
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
    </div>
  );
}

export default IngredientDashboard;
