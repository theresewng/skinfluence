import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import profile from "./assets/img/profile-placeholder.png";

function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter users based on search term
  const filteredMembers = members.filter((user) => {
    const term = searchTerm.toLowerCase();
    const username = user.username?.toLowerCase() || "";
    return username.includes(term);
  });

  // Handle delete user
  const handleDelete = async (userId) => {
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
      <header
        className="main-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Accounts</h2>
      </header>

      <div className="content-wrapper">
        <div className="left-panel">
          <div className="filters">
            <h3 className="h3-ivy">Search Members</h3>
            <form>
              <label>Username</label>
              <input
                name="username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
              />
            </form>
          </div>
        </div>

        <div className="right-panel">
          {members.length === 0 ? (
            <p>No members found.</p>
          ) : (
            filteredMembers.map((user) => (
              <div key={user?.id} className="account-card">
                <img
                  src={profile}
                  width="55px"
                  height="55px"
                  alt="" // mark as decorative
                />
                <div className="account-info">
                  <label>Username</label>
                  <h3 className="username">{user?.username}</h3>
                </div>
                <div className="account-info">
                  <label>Role</label>
                  <div className="tag-container">
                    <p className={`tag ${user?.role?.toLowerCase()}`}>
                      {user?.role || "No role assigned"}
                    </p>
                  </div>
                </div>
                <div className="account-actions">
                  <button className="activity-button">View Activity</button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
