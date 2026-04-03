import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";

// create the Context object to be consumed by other components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // initialize state directly from localStorage
  // this ensures that on page refresh, the 'token' is NOT null
  // prevents the ProtectedRoute from redirecting to Login
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  // load current role from local storage, or assign basic "user"
  const [role, setRole] = useState(localStorage.getItem("role") || "user");

  // useEffect runs w
  // never the token changes (login, logout, or initial load)
  useEffect(() => {
    if (token) {
      try {
        // decode the JWT to get user details (like username or id)
        const decoded = jwtDecode(token);
        setUser(decoded);

        // get the user role from the decoded token, or assign basic "user"
        const userRole = decoded.role || "user";
        setRole(userRole);

        // save role to local storage
        localStorage.setItem("role", userRole);
      } catch (err) {
        console.error("Token is invalid or corrupted:", err);
        logout(); // wipe storage if the token is bad
      }
    } else {
      setUser(null);
      setRole("user");
      // clear role from local storage, so it defaults back to the login screen
      localStorage.removeItem("role");
    }
  }, [token]);

  // function to handle login
  function login(newToken) {
    try {
      // decode the JWT to get user details for the NEW token
      const decoded = jwtDecode(newToken);
      setUser(decoded);

      // get the user role from the decoded token, or assign basic "user"
      const userRole = decoded.role || "user";
      setRole(userRole);

      // save the token and role to local storage
      localStorage.setItem("token", newToken);
      localStorage.setItem("role", userRole);

      setToken(newToken); // update state to trigger re-renders
    } catch (err) {
      console.error("Login unsuccessful:", err);
    }
  }

  // function to handle logout
  function logout() {
    // clear token and role from browser memory
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // reset state
    setToken(null);
    setUser(null);
    setRole("user");
  }

  return (
    // we provide 'token', 'user', and 'role' (data)
    // and 'login' and 'logout' (functions) to the whole app

    <AuthContext.Provider value={{ token, user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
