import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // global state provider
import Dashboard from "./Dashboard";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute"; // the "bounce" component
import Register from "./Register";
import Details from "./DetailsPage";

function App() {
  return (
    //wrap the entire app in AuthProvider so every component
    // can access the user's login status and token.

    <AuthProvider>
      <Router>
        <Routes>
          {/* public routes: anyone can access these */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />{" "}
          {/* ADD ROUTE HERE */}
          {/* protected route: the Dashboard is nested inside ProtectedRoute.
              It checks for a token before allowing the 
              Dashboard component to render
          */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/products/:id" element={<Details />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
