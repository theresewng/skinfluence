import { useNavigate, Link, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import "./App.css";
import { AuthContext } from "./context/AuthContext";

import Comments from "./CommentsComponent";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ingredient, setIngredient] = useState(null);
  const [openSection, setOpenSection] = useState(null);

  const { token, user } = useContext(AuthContext);

  const whoIsItFor = ingredient?.who_is_it_good_for || [];

  useEffect(() => {
    fetch(`http://localhost:5000/api/ingredients/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ingredient not found");
        return res.json();
      })
      .then((data) => setIngredient(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!ingredient) return <p>Loading...</p>;

  // split name and amount just like in Dashboard

  function toggleSection(section) {
    setOpenSection(openSection === section ? null : section);
  }

  // Handle delete product (admins only)
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
          {/* {ingredient?._id && <Comments productId={ingredient._id} />}{" "} */}
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
