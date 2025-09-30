// src/pages/Volunteers.js
import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, "volunteers"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setVolunteers(data);
      } catch (err) {
        console.error("Error fetching volunteers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this volunteer?")) return;
    try {
      await deleteDoc(doc(db, "volunteers", id));
      setVolunteers((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("Error deleting volunteer:", err);
    }
  };

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 50 }}>Loading volunteers...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <h2
        style={{
          marginBottom: "20px",
          textAlign: "center",
          color: "#6c3483",
          fontSize: "22px",
        }}
      >
        Volunteer List
      </h2>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "900px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <thead style={{ background: "#6c3483", color: "#fff" }}>
            <tr>
              {[
                "ID",
                "Full Name",
                "DOB",
                "Age",
                "Email",
                "Phone",
                "Role",
                "Location",
                "T-Shirt Size",
                "Emergency Contact",
                "Available Dates",
                "Signature",
                "Actions",
              ].map((header) => (
                <th key={header} style={thStyle}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {volunteers.map((v, idx) => (
              <tr
                key={v.id}
                style={{
                  background: idx % 2 === 0 ? "#f9f9f9" : "#fff",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <td style={tdStyle}>{v.volunteerId || "-"}</td>
                <td style={tdStyle}>{v.fullName}</td>
                <td style={tdStyle}>{v.dob}</td>
                <td style={tdStyle}>{v.age}</td>
                <td style={tdStyle}>{v.email}</td>
                <td style={tdStyle}>{v.phone}</td>
                <td style={tdStyle}>{v.preferredRole}</td>
                <td style={tdStyle}>{v.preferredLocation}</td>
                <td style={tdStyle}>{v.tshirtSize}</td>
                <td style={tdStyle}>
                  {v.emergencyName} <br /> {v.emergencyPhone}
                </td>
                <td style={tdStyle}>
                  {v.availableDates && v.availableDates.length > 0
                    ? v.availableDates.join(", ")
                    : "—"}
                </td>
                <td style={tdStyle}>{v.signature || "—"}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => handleDelete(v.id)}
                    style={deleteBtnStyle}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {volunteers.length === 0 && (
              <tr>
                <td colSpan="13" style={{ padding: "15px", textAlign: "center" }}>
                  No volunteers registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Responsive info for small devices */}
      <p
        style={{
          marginTop: 10,
          fontSize: 12,
          color: "#555",
          textAlign: "center",
        }}
      >
        Scroll horizontally on mobile to see all columns
      </p>
    </div>
  );
};

// Styles
const thStyle = {
  padding: "12px 10px",
  fontSize: "14px",
  textAlign: "center",
  whiteSpace: "nowrap",
};
const tdStyle = {
  padding: "10px 8px",
  fontSize: "13px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};
const deleteBtnStyle = {
  padding: "6px 12px",
  background: "#e74c3c",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  cursor: "pointer",
  fontSize: "13px",
};

// Optional: media queries using inline JS for mobile adjustments
// Wrap this in a useEffect if you want dynamic font resizing or column adjustments
// Example: hiding some columns on very small screens can improve UX

export default Volunteers;
