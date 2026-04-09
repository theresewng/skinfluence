import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./App.css";

function Login() {
  // Stores user input for username field
  const [username, setUsername] = useState("");

  // Stores user input for password field
  const [password, setPassword] = useState("");

  // Auth context provides login function to store JWT / auth state
  const { login } = useContext(AuthContext);

  // Used to redirect user after successful login
  const navigate = useNavigate();

    /**
   * Handles login form submission
   * Sends credentials to backend and stores token if successful
   */
  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token);
        navigate("/products");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="page-container bkgd-green">
      <div className="login-page">
        {/* Left image */}
        <div className="login-image">
          <img
            src="https://plus.unsplash.com/premium_photo-1661630984481-e29093921ff7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Welcome"
          />
        </div>

        {/* Right login form */}
        <div className="login-container">
          <h2>Welcome Back</h2>
          
          {/* Login form */}
          <form onSubmit={handleLogin} className="login-form">

            {/* Username input */}
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />

            {/* Password input */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />

            {/* Submit button */}
            <button type="submit" className="login-button">
              Login
            </button>
          </form>

          {/* Link to registration page */}
          <p className="login-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
