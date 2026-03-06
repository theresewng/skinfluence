// import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext"; // global state provider
// import NavBar from "./NavBar";
// import Dashboard from "./Dashboard";
// import Login from "./Login";
// import ProtectedRoute from "./ProtectedRoute"; // the "bounce" component
// import Register from "./Register";

// function App() {
//   return (
//     //wrap the entire app in AuthProvider so every component
//     // can access the user's login status and token.

//     <AuthProvider>
//       <Router>
//         <NavBar />
//         <Routes>
//           {/* public routes: anyone can access these */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />{" "}
//           {/* ADD ROUTE HERE */}
//           {/* protected route: the Dashboard is nested inside ProtectedRoute.
//               It checks for a token before allowing the
//               Dashboard component to render
//           */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./NavBar";
import Dashboard from "./Dashboard";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Register";
import ProductDetails from "./ProductDetails";

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Product details page */}
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute>
                <ProductDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
