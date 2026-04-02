import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import Comments from "./CommentsComponent";

function ProductDetails() {
  const { id } = useParams();
  const [ingredient, setIngredient] = useState(null);
  const [openSection, setOpenSection] = useState(null);

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

  return (
    <div className="page-container bkgd-blue">
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
                What is it?{" "}
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
                What does this ingredient do?{" "}
              </button>

              {openSection === "whatdoesitdo" && (
                <div className="accordion-body">
                  <p>
                    {" "}
                    {ingredient.what_does_it_do || "No information available."}
                  </p>
                </div>
              )}
            </div>

            <div className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => toggleSection("whoshoulduseit")}
              >
                Who should use it?{" "}
              </button>

              {openSection === "whoshoulduseit" && (
                <div className="accordion-body">
                  <p>
                    Users with{" "}
                    {ingredient.who_is_it_good_for ||
                      "No information available."}
                  </p>
                </div>
              )}
            </div>

            <div className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => toggleSection("comments")}
              >
                Comments
              </button>

              {openSection === "comments" && (
                <div className="accordion-body">
                  {ingredient?._id ? (
                    <Comments productId={ingredient._id} />
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
