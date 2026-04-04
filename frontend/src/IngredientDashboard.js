// import { useContext, useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import "./App.css";
// import { AuthContext } from "./context/AuthContext";

// function IngredientDashboard() {
//   const [ingredients, setIngredients] = useState([]);
//   const [visibleCount, setVisibleCount] = useState(30);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [savedIngredients, setSavedIngredients] = useState([]);

//   const { token, user } = useContext(AuthContext);

//   // Load products from backend
//   // Initial fetch
//   useEffect(() => {
//     fetchIngredients(0, 30);
//   }, []);

//   useEffect(() => {
//     if (user?.savedIngredientIDs) {
//       setSavedIngredients(user.savedIngredientIDs);
//     }
//   }, [user]);

//   const fetchIngredients = async (skip, limit) => {
//     try {
//       const res = await fetch("http://localhost:5000/api/ingredients");
//       const data = await res.json();
//       setIngredients((prev) => {
//         const combined = [...prev, ...data];

//         const unique = Array.from(
//           new Map(combined.map((item) => [item._id, item])).values(),
//         );

//         return unique;
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const filteredIngredients = ingredients.filter((ingredient) => {
//     const term = searchTerm.toLowerCase();
//     const name = ingredient.name?.toLowerCase() || "";
//     const description = ingredient.short_description?.toLowerCase() || "";
//     const matchesSearch = name.includes(term) || description.includes(term);
//     return matchesSearch;
//   });

//   // See More handler
//   const handleSeeMore = () => {
//     fetchIngredients(ingredients.length, 30); // fetch next 30 items
//     setVisibleCount((prev) => prev + 30);
//   };

//   // const saveIngredient = async (id) => {
//   //   try {
//   //     // Send POST request to backend to save ingredient to user's favourites
//   //     const response = await fetch(
//   //       "http://localhost:5000/api/auth/save-ingredient",
//   //       {
//   //         method: "POST",
//   //         headers: {
//   //           // Attach content type and token
//   //           "Content-Type": "application/json",
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //         body: JSON.stringify({ ingredientId: id }), // send the ingredient ID in the body
//   //       },
//   //     );

//   //     if (!response.ok) throw new Error("Failed to save ingredient");

//   //     alert("Ingredient saved to favourites!");
//   //   } catch (err) {
//   //     console.error(err);
//   //     alert(err.message);
//   //   }
//   // };

//   const saveIngredient = async (id) => {
//     if (!token) return alert("You are not logged in!");
//     try {
//       const response = await fetch(
//         "http://localhost:5000/api/auth/save-ingredient",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token.trim()}`,
//           },
//           body: JSON.stringify({ ingredientId: id }),
//         },
//       );

//       if (!response.ok) throw new Error(await response.text());

//       // Update local state immediately
//       setSavedIngredients((prev) => [...prev, id]);
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     }
//   };

//   const removeFromFavourites = async (ingredientId) => {
//     const authToken = token?.trim();
//     if (!authToken) {
//       alert("You are not logged in!");
//       return;
//     }

//     try {
//       const response = await fetch(
//         "http://localhost:5000/api/auth/remove-ingredient",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${authToken}`,
//           },
//           body: JSON.stringify({ ingredientId }),
//         },
//       );

//       if (!response.ok) {
//         const errMsg = await response.text();
//         throw new Error(errMsg);
//       }

//       // ✅ Only update savedIngredients state
//       setSavedIngredients((prev) => prev.filter((id) => id !== ingredientId));

//       alert("Removed from favourites!");
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     }
//   };

//   // Save an ingredient to favourites
//   const handleSaveIngredient = async (ingredientId) => {
//     if (!token) return alert("You are not logged in!");

//     try {
//       const response = await fetch(
//         "http://localhost:5000/api/auth/save-ingredient",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token.trim()}`,
//           },
//           body: JSON.stringify({ ingredientId }),
//         },
//       );

//       if (!response.ok) throw new Error(await response.text());

//       // ✅ Update savedIngredients state only
//       setSavedIngredients((prev) => [...prev, ingredientId]);
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     }
//   };

//   const toggleFavouriteIngredient = async (ingredientId, isSaved) => {
//     if (!token) return alert("You are not logged in!");

//     const url = `http://localhost:5000/api/auth/${isSaved ? "remove-ingredient" : "save-ingredient"}`;

//     try {
//       const response = await fetch(url, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token.trim()}`,
//         },
//         body: JSON.stringify({ ingredientId }),
//       });

//       if (!response.ok) throw new Error(await response.text());

//       setSavedIngredients((prev) =>
//         isSaved
//           ? prev.filter((id) => id !== ingredientId)
//           : [...prev, ingredientId],
//       );
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     }
//   };

//   // Remove an ingredient from favourites
//   const handleRemoveIngredient = async (ingredientId) => {
//     if (!token) return alert("You are not logged in!");

//     try {
//       const response = await fetch(
//         "http://localhost:5000/api/auth/remove-ingredient",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token.trim()}`,
//           },
//           body: JSON.stringify({ ingredientId }),
//         },
//       );

//       if (!response.ok) throw new Error(await response.text());

//       // ✅ Only remove from savedIngredients
//       setSavedIngredients((prev) => prev.filter((id) => id !== ingredientId));

//       alert("Removed from favourites!");
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     }
//   };

//   return (
//     <div className="page-container">
//       <header className="main-header">
//         <div>{user && <h2>Welcome back, {user.username}!</h2>}</div>
//       </header>

//       <div className="content-wrapper">
//         <div className="left-panel">
//           <div className="filters">
//             <h3 className="h3-ivy">Filter</h3>
//             <label>Search</label>
//             <input
//               type="text"
//               placeholder="Search by name, brand, category..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </div>

//         <div className="right-panel">
//           <div className="products-wrapper">
//             <div className="product-grid">
//               {filteredIngredients.slice(0, visibleCount).map((ingredient) => (
//                 <div key={ingredient._id} className="product-card">
//                   <div className="product-details">
//                     <h3 className="h3-ivy">{ingredient.name}</h3>

//                     <h3 className="h3-neue">
//                       <strong>What is it:</strong>
//                     </h3>
//                     <p>{ingredient.what_is_it}</p>

//                     <div className="button-group">
//                       <Link to={`/ingredients/${ingredient._id}`}>
//                         <button>See Details</button>
//                       </Link>

//                       <button
//                         onClick={() =>
//                           toggleFavouriteIngredient(
//                             ingredient._id,
//                             savedIngredients.includes(ingredient._id),
//                           )
//                         }
//                       >
//                         {savedIngredients.includes(ingredient._id)
//                           ? "Remove from Favourites"
//                           : "Save to Favourites"}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* BUTTON OUTSIDE GRID */}
//             {ingredients.length >= visibleCount && (
//               <div style={{ textAlign: "center", margin: "20px 0" }}>
//                 <button
//                   onClick={handleSeeMore}
//                   style={{ padding: "10px 20px", cursor: "pointer" }}
//                 >
//                   See More
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default IngredientDashboard;

import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";

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
    <div className="page-container">
      <header className="main-header">
        {user && <h2>Welcome back, {user.username}!</h2>}
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

                      <button
                        onClick={() =>
                          toggleFavouriteIngredient(ingredient._id)
                        }
                      >
                        {savedIngredients.includes(ingredient._id)
                          ? "Remove from Favourites"
                          : "Save to Favourites"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
