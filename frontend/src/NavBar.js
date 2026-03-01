import { Link } from "react-router-dom";
import logotype from "./assets/logo/logotype.png";

function NavBar() {
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
        <Link className="nav-button" to="/">
          Products
        </Link>
        <Link className="nav-button" to="/">
          Ingredients
        </Link>
        <Link className="nav-button" to="/login">
          Login
        </Link>
      </div>
    </nav>
  );
}

export default NavBar;
