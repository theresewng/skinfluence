// import { useContext, useEffect, useState } from "react";
// import "./App.css";
// import { AuthContext } from "./context/AuthContext"; // import the global "cloud" to access our token and user

// function Dashboard() {
//   // local State: managing the data strictly on this specific page
//   const [products, setProducts] = useState([]); // holds the array of products from the database
//   const [visibleCount, setVisibleCount] = useState(30);
//   const [formData, setFormData] = useState({
//     // holds the current text typed into the form
//     productName: "",
//     brand: "",
//     usageType: "",
//     category: "",
//     ingredients: "",
//     imageURL: "",
//   });
//   const [searchTerm, setSearchTerm] = useState("");

//   // Filtered products based on search
//   const filteredProducts = products.filter((product) => {
//     const term = searchTerm.toLowerCase();
//     const matchesSearch =
//       product.productName.toLowerCase().includes(term) ||
//       product.brand.toLowerCase().includes(term) ||
//       product.category.toLowerCase().includes(term);

//     const matchesBrand = selectedBrand ? product.brand === selectedBrand : true;

//     return matchesSearch && matchesBrand;
//   });

//   const uniqueBrands = [...new Set(products.map((product) => product.brand))];
//   const [selectedBrand, setSelectedBrand] = useState("");

//   // tap into our AuthContext
//   // we grab the token, the decoded user object (for the greeting),
//   // and the logout function (to attach to our button)
//   const { token, user, logout } = useContext(AuthContext);

//   // initial data load: runs once when the Dashboard first appears on the screen
//   useEffect(() => {
//     // GET is a public route on our backend, so we DO NOT need to attach the token here
//     // anyone can view the plants.
//     fetch(`http://localhost:5000/api/products?limit=30&skip=0`)
//       .then((res) => res.json())
//       .then((data) => setProducts(data))
//       .catch((err) => console.error("Error fetching products:", err));
//   }, []); // empty array ensures this only happens once on mount

//   // helper function for the Controlled Form
//   // Updates the specific field in our formData state based on the input's 'name' attribute
//   function handleChange(e) {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   }

//   // creating data: protected POST request
//   async function handleSubmit(e) {
//     e.preventDefault(); // stop the page from refreshing

//     try {
//       const response = await fetch(
//         "http://localhost:5000/api/products?limit=30&skip=0",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             // attach the token to prove user is authorized
//             Authorization: token,
//           },
//           body: JSON.stringify(formData), // send the form data to the server
//         },
//       );

//       // basic error handling if the token is invalid/missing or the server rejects
//       if (!response.ok) {
//         throw new Error("Failed to add plant. Are you authorized?");
//       }

//       // if successful, the server sends back the newly created plant (including its new MongoDB _id)
//       const newPlant = await response.json();

//       // update our local React state to include the new plant instantly without refreshing the page
//       setProducts([...products, newPlant]);

//       // clear the form fields
//       setFormData({
//         commonName: "",
//         family: "",
//         category: "",
//         brand: "",
//         usageType: "",
//         ingredients: "",
//         imageURL: "",
//       });
//     } catch (err) {
//       console.error(err);
//       alert(err.message); // show the error to the user
//     }
//   }

//   // deleting data: protected DELETE request
//   const handleDelete = async (id) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/products/${id}`, {
//         method: "DELETE",
//         headers: {
//           // attach the token to prove user is authorized - again
//           Authorization: token,
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to delete. Are you authorized?");
//       }

//       // if the backend successfully deleted it, remove it from our local React state
//       // this filters out the deleted product so it disappears from the screen instantly
//       setProducts(products.filter((product) => product._id !== id));
//     } catch (err) {
//       console.error(err);
//       alert(err.message);
//     }
//   };

//   return (
//     <div className="page-container">
//       <header
//         className="main-header"
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <div>
//           <h1 style={{ margin: 0 }}>Skinfluence</h1>
//           {/* conditional rendering: only show the welcome message if the user object successfully loaded */}
//           {user && (
//             <h3 style={{ color: "#2e7d32", marginTop: "5px", marginBottom: 0 }}>
//               Welcome back, {user.username}!
//             </h3>
//           )}
//         </div>

//         {/* Logout button: connected directly to the global logout function from our Context */}
//         <button
//           onClick={logout}
//           style={{
//             padding: "10px 20px",
//             backgroundColor: "#c62828",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             cursor: "pointer",
//             fontWeight: "bold",
//           }}
//         >
//           Logout
//         </button>
//       </header>

//       <div className="content-wrapper">
//         <div className="left-panel">
//           <div className="card form-card">
//             <h3>Add New Plant</h3>
//             <form onSubmit={handleSubmit} className="plant-form">
//               <label>Search/Filter Products</label>

//               <div className="search-bar">
//                 <input
//                   type="text"
//                   placeholder="Search here..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <label>Filter by Brand:</label>
//               <select
//                 value={selectedBrand}
//                 onChange={(e) => setSelectedBrand(e.target.value)}
//               >
//                 <option value="">All Brands</option>
//                 {uniqueBrands.map((brand) => (
//                   <option key={brand} value={brand}>
//                     {brand}
//                   </option>
//                 ))}
//               </select>

//               {/* <label>Product Name</label> */}
//               {/* note: 'name' must match the keys in our formData state for handleChange to work */}
//               {/* <input
//                 name="productName"
//                 value={formData.productName}
//                 onChange={handleChange}
//                 required
//               /> */}

//               {/* <label>Brand</label>
//               <input
//                 name="brand"
//                 value={formData.brand}
//                 onChange={handleChange}
//               /> */}

//               {/* <label>Category</label>
//               <input
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//               /> */}

//               <button type="search">Filter Product</button>
//             </form>
//           </div>
//         </div>

//         {/* right panel: the grid of products */}
//         <div className="right-panel">
//           <div className="product-grid">
//             {filteredProducts.slice(0, visibleCount).map((product) => {
//               // Extract amount: in our case the amount of product, is after the last comma in the product name
//               const nameParts = product.productName.split(",");
//               const amount = nameParts.length > 1 ? nameParts.pop().trim() : "";
//               //join the rest with the product name
//               const cleanName = nameParts.join(",").trim();

//               return (
//                 <div key={product._id} className="product-card">
//                   <div className="image-container">
//                     {product.imageUrl ? (
//                       <img src={product.imageUrl} alt={product.productName} />
//                     ) : (
//                       <div className="placeholder">No Image</div>
//                     )}
//                   </div>

//                   <div className="card-details">
//                     <h3 className="h3-ivy">{product.brand}</h3>
//                     <h3 className="h3-neue">{cleanName}</h3>

//                     {amount && <p className="h3-neue-light"> {amount}</p>}

//                     <p className="h3-ivy">
//                       <strong>Usage Type:</strong> {product.usageType}
//                     </p>

//                     <p className="h3-ivy">
//                       <strong>Category:</strong> {product.category}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}

//             {visibleCount < products.length && (
//               <button
//                 onClick={() => setVisibleCount((prev) => prev + 30)}
//                 // style={{
//                 //   marginTop: "20px",
//                 //   padding: "10px 20px",
//                 //   cursor: "pointer",
//                 // }}
//               >
//                 See More
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;

import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import { AuthContext } from "./context/AuthContext";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [formData, setFormData] = useState({
    productName: "",
    brand: "",
    usageType: "",
    category: "",
    ingredients: "",
    imageURL: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const { token, user, logout } = useContext(AuthContext);

  // Load products from backend
  useEffect(() => {
    fetch(`http://localhost:5000/api/products?limit=30&skip=0`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Extract unique brands for the dropdown
  const uniqueBrands = [...new Set(products.map((product) => product.brand))];

  // Filter products based on search term and selected brand
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      product.productName.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term);
    const matchesBrand = selectedBrand ? product.brand === selectedBrand : true;
    return matchesSearch && matchesBrand;
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:5000/api/products?limit=30&skip=0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) throw new Error("Failed to add product");

      const newProduct = await response.json();
      setProducts([...products, newProduct]);

      setFormData({
        productName: "",
        brand: "",
        usageType: "",
        category: "",
        ingredients: "",
        imageURL: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!response.ok) throw new Error("Failed to delete product");
      setProducts(products.filter((product) => product._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      <header
        className="main-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Skinfluence</h1>
          {user && (
            <h3 style={{ color: "#2e7d32", marginTop: 5, marginBottom: 0 }}>
              Welcome back, {user.username}!
            </h3>
          )}
        </div>
        <button
          onClick={logout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#c62828",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </header>

      <div className="content-wrapper">
        <div className="left-panel">
          <div className="card form-card">
            <h3 className="h3-ivy">Filter</h3>
            <form onSubmit={handleSubmit} className="plant-form">
              <label>Search Products</label>
              <input
                type="text"
                placeholder="Search by name, brand, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <label>Filter by Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <button type="submit">Add Product</button>
            </form>
          </div>
        </div>

        <div className="right-panel">
          <div className="product-grid">
            {filteredProducts.slice(0, visibleCount).map((product) => {
              const nameParts = product.productName.split(",");
              const amount = nameParts.length > 1 ? nameParts.pop().trim() : "";
              const cleanName = nameParts.join(",").trim();

              return (
                <div key={product._id} className="product-card">
                  <div className="image-container">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.productName} />
                    ) : (
                      <div className="placeholder">No Image</div>
                    )}
                  </div>
                  <div className="card-details">
                    <h3 className="h3-ivy">{product.brand}</h3>
                    <h3 className="h3-neue">{cleanName}</h3>
                    {amount && <p className="h3-neue-light">{amount}</p>}
                    <p className="h3-ivy">
                      <strong>Usage Type:</strong> {product.usageType}
                    </p>
                    <p className="h3-ivy">
                      <strong>Category:</strong> {product.category}
                    </p>
                    <Link to={`/products/${product._id}`}>
                      <button>See Details</button>
                    </Link>
                  </div>
                </div>
              );
            })}

            {visibleCount < filteredProducts.length && (
              <button onClick={() => setVisibleCount((prev) => prev + 30)}>
                See More
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
