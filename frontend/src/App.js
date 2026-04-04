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
import AccountActivity from "./AccountActivity";
import IngredientDashboard from "./IngredientDashboard";
import IngredientDetails from "./IngredientDetails";

function AppRoutes() {
  const { token, user } = useContext(AuthContext);

  return (
    <>
      <NavBar />

      <Routes>
        <Route
          path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} />}
        />

        {/* Public routes */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login />}
        />

        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ingredients"
          element={
            <ProtectedRoute>
              <IngredientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ingredients/:id"
          element={
            <ProtectedRoute>
              <IngredientDetails />
            </ProtectedRoute>
          }
        />

        {/* Saved Items page */}
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedItems />
            </ProtectedRoute>
          }
        />

        {/* Admin (Manage Accounts) page */}
        <Route
          path="/admin"
          element={
            // Evaluate admin role before navigating to admin dashboard
            user?.role === "admin" ? (
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            ) : (
              <Navigate to={token ? "/dashboard" : "/login"} />
            )
          }
        />

        {/* Account Activity page */}
        <Route
          path="/activity/:id"
          element={
            // Evaluate admin role before navigating to account activity
            user?.role === "admin" ? (
              // <ProtectedRoute>
              <AccountActivity />
            ) : (
              // </ProtectedRoute>
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
