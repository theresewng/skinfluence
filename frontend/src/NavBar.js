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

      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </nav>
  );
}

export default NavBar;
