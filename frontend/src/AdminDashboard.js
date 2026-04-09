import { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import profile from "./assets/img/profile-placeholder.png";

function AdminDashboard() {
    // State to store all members fetched from backend
  const [members, setMembers] = useState([]);

    // State for searching users by username
  const [searchTerm, setSearchTerm] = useState("");

    // State for filtering users by role (admin/user)
  const [selectedUserRole, setSelectedUserRole] = useState("");

  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);

  // Protect route: redirect non-admin users to login page
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/login");
    }
  }, [token, user, navigate]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [searchTerm]); // Re-fetch when search term changes

  // Function to fetch all users from backend API
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

  // Filter users based on search input + selected role filter
  const filteredMembers = members.filter((user) => {
    const term = searchTerm.toLowerCase();
    const username = user.username?.toLowerCase() || "";

    // Check if username matches search input
    const matchesSearch = username.includes(term);
    const matchesUserRole = selectedUserRole
      ? user.role === selectedUserRole
      : true;
    return matchesSearch && matchesUserRole;
  });

  // Handle deleting a user account
  const handleDelete = async (userId, userRole) => {
    // Prevent deletion of admin accounts
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
          // NOTE: authentication headers (token) should be added here
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
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Accounts</h2>
      </header>

      <div className="content-wrapper">
        <div className="left-panel">
          <div className="filters">
            <h3 className="h3-ivy">Search Members</h3>
            <form>
            {/* Search by username input */}
              <label>By Username</label>
              <input
                name="username"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                required
              />

              {/* Filter by role dropdown */}
              <label>By User Role</label>
              <select
                value={selectedUserRole}
                onChange={(e) => setSelectedUserRole(e.target.value)}
              >
                <option value="">All Users</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </form>
          </div>
        </div>

        <div className="right-panel">
          {filteredMembers.length === 0 ? (
            <p>No members found. Please try a different search or filter.</p>
          ) : (
            filteredMembers.map((user) => (
              <article key={user?.id} className="account-card">
                <img
                  src={profile}
                  width="55px"
                  height="55px"
                  alt="" // mark as decorative
                />
                <div className="account-info">
                  {/* Display username */}
                  <div className="username-section">
                    <label>Username</label>
                    <h3 className="username">{user?.username}</h3>
                  </div>

                  {/* Display role */}
                  <div className="role-section">
                    <label>Role</label>
                    <div className="tag-container">
                      <p className={`tag ${user?.role?.toLowerCase()}`}>
                        {user?.role || "No role assigned"}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Display buttons, if not admin */}
                <div className="account-actions">
                  {user.role !== "admin" && (
                    <>
                      <Link to={`/activity/${user.id}`}>
                        <button className="activity-button">
                          View Activity
                        </button>
                      </Link>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(user.id, user.role)}
                      >
                        Delete Account
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
