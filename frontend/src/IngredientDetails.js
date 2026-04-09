import { useNavigate, Link, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import "./App.css";
import { AuthContext } from "./context/AuthContext";

import Comments from "./CommentsComponent";

function ProductDetails() {
  // Get ingredient ID from URL params (/ingredients/:id)
  const { id } = useParams();

  // Used to navigate programmatically (e.g., after delete)
  const navigate = useNavigate();

  // Stores fetched ingredient data
  const [ingredient, setIngredient] = useState(null);
  
  // Tracks which accordion section is currently open
  const [openSection, setOpenSection] = useState(null);

  // Auth context (token + user role)
  const { token, user } = useContext(AuthContext);
  
  // Extract "who is it good for" list safely (fallback to empty array)
  const whoIsItFor = ingredient?.who_is_it_good_for || [];

    /**
   * Fetch ingredient details when page loads or ID changes
   */
  useEffect(() => {
    fetch(`http://localhost:5000/api/ingredients/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ingredient not found");
        return res.json();
      })
      .then((data) => setIngredient(data))
      .catch((err) => console.error(err));
  }, [id]);

  // Loading state while data is being fetched
  if (!ingredient) return <p>Loading...</p>;

 /**
   * Toggles accordion sections (open/close behavior)
   */
  function toggleSection(section) {
    setOpenSection(openSection === section ? null : section);
  }

 /**
   * Deletes ingredient (admin only action)
   */
    const handleDelete = async () => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this ingredient?")) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/ingredients/${ingredient._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token.trim()}` }, // Include token for authentication
        },
      );
      if (!res.ok) {
        const data = await res.json();
        console.error("Failed to delete ingredient:", data);
        alert(
          "Failed to delete ingredient: " + (data.message || "Unknown error"),
        );
        return;
      }
      alert("Ingredient deleted successfully");

      setIngredient(null);
      navigate("/ingredients"); // Go back to ingredient dashboard
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the ingredient.");
    }
  };

  return (
    <div className="page-container bkgd-blue">
      <div className="space-between">
        <Link to="/ingredients">
          <button>← Back to Ingredient Search</button>
        </Link>

        {user?.role === "admin" && (
          <button className="delete-button" onClick={handleDelete}>
            Delete This Ingredient
          </button>
        )}
      </div>
      <div className="product-section">
        <div className="info-content-wrapper">
          <div>
            <h3 className="h3-ivy">{ingredient.name}</h3>

            <div className="accordion">
              <div className="accordion-item">
                <button
                  className="accordion-header"
                  onClick={() => toggleSection("whatisit")}
                >
                  <span>What is it?</span>
                  <span className="accordion-icon">
                    {openSection === "whatisit" ? "−" : "+"}
                  </span>
                </button>

                {openSection === "whatisit" && (
                  <div className="accordion-body">
                    {ingredient.what_is_it || "No information available."}
                  </div>
                )}
              </div>

              {/* What does it do section */}
              <div className="accordion-item">
                <button
                  className="accordion-header"
                  onClick={() => toggleSection("whatdoesitdo")}
                >
                  <span>What does this ingredient do?</span>
                  <span className="accordion-icon">
                    {openSection === "whatdoesitdo" ? "−" : "+"}
                  </span>
                </button>

                {openSection === "whatdoesitdo" && (
                  <div className="accordion-body">
                    {ingredient.what_does_it_do || "No information available."}
                  </div>
                )}
              </div>

              {/* Who should use it section */}
              <div className="accordion-item">
                <button
                  className="accordion-header"
                  onClick={() => toggleSection("whoshoulduseit")}
                >
                  <span>Who should use it?</span>
                  <span className="accordion-icon">
                    {openSection === "whoshoulduseit" ? "−" : "+"}
                  </span>
                </button>

                {openSection === "whoshoulduseit" && (
                  <div className="accordion-body">
                    <ul>
                      {(ingredient?.who_is_it_good_for || "")
                        .toString()
                        .replace(/[\[\]']/g, "")
                        .split(",")
                        .map((i) => i.trim())
                        .filter(Boolean)
                        .map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Comments section */}
              <div className="accordion-item">
                <button
                  className="accordion-header"
                  onClick={() => toggleSection("comments")}
                >
                  <span>Comments</span>
                  <span className="accordion-icon">
                    {openSection === "comments" ? "−" : "+"}
                  </span>
                </button>

                {openSection === "comments" && (
                  <div className="accordion-body">
                    {ingredient?._id ? (
                      <Comments ingredientId={ingredient._id} />
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
    </div>
  );
}

export default ProductDetails;
