import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function AccountActivity() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState("");

  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  // If they aren't an admin, redirect them out
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/login");
    }
  }, [token, user, navigate]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [searchTerm]); // Re-fetch when search term changes

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users`);
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to fetch users:", data);
        return;
      }
      console.log("Fetched users");
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle delete user
  const handleDelete = async (userId, userRole) => {
    // Prevent deleting other admins
    if (userRole === "admin") {
      alert("You cannot delete admin accounts.");
      return;
    }

    // Confirm before deleting
    if (!window.confirm("Are you sure you want to delete this account?")) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/users/${userId}`,
        {
          method: "DELETE",
          // Add headers/token here for authentication
        },
      );
      if (!res.ok) {
        const data = await res.json();
        console.error("Failed to delete user:", data);
        alert("Failed to delete user: " + (data.message || "Unknown error"));
        return;
      }
      alert("User deleted successfully");

      fetchUsers(); // Refresh the user list
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the user.");
    }
  };

  return (
    <div className="page-container bkgd-purple">
      <div className="space-between">
        <button>← Back to Admin Dashboard</button>
        <button className="delete-button">Delete This Account</button>
      </div>

      <header className="main-header">
        <p>Viewing account activity for…</p>
        <h2>Username</h2>
      </header>

      <div className="three-col-grid content-wrapper">
        {/* Favourite Products */}
        <section className="fav-products-section">
          <h3>Favourite Products</h3>
          <article>
            <p>No. 7</p>
            <h4>
              Hydra Luminous Aqua Release Skin Perfector Tinted Moisturiser
            </h4>
            <button>Go to Product</button>
          </article>
        </section>

        {/* Favourite Ingredients */}
        <section className="fav-ingredients-section">
          <h3>Favourite Ingredients</h3>
          <article className="activity-card">
            <h4>Alanine</h4>
            <button>Go to Ingredient</button>
          </article>
        </section>

        {/* Comments */}
        <section className="comments-section">
          <h3>Comments</h3>
          <article className="activity-card">
            <h4>
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua."
            </h4>
            <p>
              for Hydra Luminous Aqua Release Skin Perfector Tinted Moisturiser
            </p>
            <button>Go to Comment</button>
          </article>
        </section>
      </div>
    </div>
  );
}

export default AccountActivity;
