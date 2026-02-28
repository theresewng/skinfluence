import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav style={{ background: "#333", padding: "1rem" }}>
      <Link to="/" style={{ color: "white", margin: "0 1rem" }}>
        Dashboard
      </Link>
      <Link to="/login" style={{ color: "white", margin: "0 1rem" }}>
        Login
      </Link>
      <Link to="/register" style={{ color: "white", margin: "0 1rem" }}>
        Register
      </Link>
    </nav>
  );
}

export default NavBar;
