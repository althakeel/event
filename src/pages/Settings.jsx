import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const allModules = [
  { key: "dashboard", label: "Dashboard" },
  { key: "users", label: "All Students" },
  { key: "attendance", label: "Class Attendance" },
  { key: "break", label: "Break Out" },
  { key: "teams", label: "Teams / Groups" },
  { key: "notifications", label: "Notifications" },
  { key: "settings", label: "Settings" },
  { key: "messages", label: "Messages / Announcements" },
  { key: "history", label: "Event History" },
];

const Settings = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Staff");
  const [permissions, setPermissions] = useState([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("All");

  // Fetch users in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "dashboardUsers"), (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    });
    return () => unsubscribe();
  }, []);

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!emailOrPhone || !password) {
      setMessage("Please fill all fields.");
      return;
    }
    try {
      await addDoc(collection(db, "dashboardUsers"), {
        emailOrPhone,
        password,
        role,
        permissions, // store selected permissions
        createdAt: serverTimestamp(),
      });
      setMessage("User added successfully!");
      setEmailOrPhone("");
      setPassword("");
      setRole("Staff");
      setPermissions([]);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error adding user. Try again.");
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteDoc(doc(db, "dashboardUsers", id));
      setMessage("User deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Handle permission toggle
  const handlePermissionChange = (key) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  // Filter users by role
  const filteredUsers = users.filter((u) => filterRole === "All" || u.role === filterRole);

  return (
    <div
      style={{
        padding: 20,
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        background: "#f5f6fa",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 25 }}>Dashboard User Management</h2>

      {/* Add User Form */}
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto 30px",
          background: "#fff",
          padding: 25,
          borderRadius: 12,
          boxShadow: "0 4px 25px rgba(0,0,0,0.05)",
        }}
      >
        <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
            <input
              type="text"
              placeholder="Email or Phone Number"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              style={{
                flex: "1 1 250px",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ccc",
                fontSize: 16,
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                flex: "1 1 180px",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ccc",
                fontSize: 16,
              }}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                flex: "1 1 140px",
                padding: 12,
                borderRadius: 8,
                border: "1px solid #ccc",
                fontSize: 16,
              }}
            >
              <option value="Admin">Admin</option>
              <option value="Operator">Operator</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          {/* Permissions */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              padding: "10px 0",
              borderTop: "1px solid #eee",
              borderBottom: "1px solid #eee",
            }}
          >
            {allModules.map((mod) => (
              <label key={mod.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <input
                  type="checkbox"
                  checked={permissions.includes(mod.key)}
                  onChange={() => handlePermissionChange(mod.key)}
                />
                {mod.label}
              </label>
            ))}
          </div>

          <button
            type="submit"
            style={{
              padding: 12,
              borderRadius: 8,
              border: "none",
              backgroundColor: "#2980b9",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: 16,
              alignSelf: "flex-start",
            }}
          >
            Add User
          </button>

          {message && (
            <p
              style={{
                marginTop: 15,
                textAlign: "center",
                color: message.includes("successfully") ? "green" : "red",
              }}
            >
              {message}
            </p>
          )}
        </form>
      </div>

      {/* Filter by Role */}
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto 20px",
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <label>
          Filter by Role:{" "}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ padding: 8, borderRadius: 6, fontSize: 14 }}
          >
            <option value="All">All</option>
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
            <option value="Staff">Staff</option>
          </select>
        </label>
      </div>

      {/* Users List */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        {filteredUsers.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#888", padding: 50 }}>
            No users found
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              style={{
                background: "#fff",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ marginBottom: 15 }}>
                <h4 style={{ margin: 0, wordBreak: "break-word" }}>{u.emailOrPhone}</h4>
                <p style={{ margin: "5px 0", color: "#2980b9", fontWeight: "600" }}>{u.role}</p>
                <p style={{ margin: "5px 0", fontSize: 12, color: "#7f8c8d" }}>
                  Created: {u.createdAt?.toDate?.().toLocaleString() || "-"}
                </p>
                <p style={{ margin: "5px 0", fontSize: 12, color: "#34495e" }}>
                  Permissions:{" "}
                  {u.permissions
                    ?.map((p) => allModules.find((m) => m.key === p)?.label)
                    .join(", ") || "-"}
                </p>
              </div>
              <button
                onClick={() => handleDeleteUser(u.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#c0392b",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Settings;
