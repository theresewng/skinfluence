import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import NavBar from "./NavBar";
import Dashboard from "./Dashboard";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./Register";
import ProductDetails from "./ProductDetails";
import SavedItems from "./SavedItems";
import AdminDashboard from "./AdminDashboard";
import IngredientDashboard from "./IngredientDashboard";
import IngredientDetails from "./IngredientDetails";

function AppRoutes() {
  const { token, user } = useContext(AuthContext);

  return (
    <>
      <NavBar />

      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Public routes */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route path="/register" element={<Register />} />

        {/* Public Dashboard (product listing viewable by all) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Product & Ingredient details are public */}
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/ingredients" element={<IngredientDashboard />} />
        <Route path="/ingredients/:id" element={<IngredientDetails />} />

        {/* Protected routes (actions requiring login) */}
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedItems />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            ) : (
              <Navigate to={token ? "/dashboard" : "/login"} />
            )
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
