import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import logotype from "./assets/logo/logotype.png";

function NavBar() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears token & user
    navigate("/login"); // redirect to login page
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <Link to="/" title="Go to the home page" id="logo">
          <img
            src={logotype}
            title="logo"
            alt="Skinfluence: Here because your skin matters."
            className="logotype"
          />
        </Link>
      </div>

      <div className="nav-links">
        {/* Skincare Products */}
        <Link className="nav-button" to="/">
          Products
        </Link>

        {/* Skincare Ingredients */}
        <Link className="nav-button" to="/ingredients">
          Ingredients
        </Link>

        {/* Conditional User Profile */}
        {user && user.role === "user" && (
          <Link className="nav-button" to="/saved">
            My Profile
          </Link>
        )}

        {/* Conditional Admin Dashboard */}
        {user && user.role === "admin" && (
          <Link className="nav-button" to="/admin">
            Admin
          </Link>
        )}

        {/* Conditional Login / Logout */}
        {token ? (
          <button className="nav-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link className="nav-button" to="/login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
