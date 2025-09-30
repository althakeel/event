import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../images/bcst.jpeg"; // Your logo path

const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f7fa",
        padding: "20px",
      }}
    >
      {/* Card Container */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          padding: "40px 30px",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        {/* Top Section with Church Info */}
        <div style={{ marginBottom: "30px" }}>
          <img src={Logo} alt="Logo" style={{ maxWidth: 100, marginBottom: 20 }} />
          <h2 style={{ margin: 0, fontSize: 20, color: "#2c3e50", textTransform: "uppercase" }}>
            Malayalee Catholic Community
          </h2>
          <h3 style={{ margin: "5px 0", fontSize: 16, color: "#555" }}>
            St. Mary’s Church, Dubai
          </h3>
          <p style={{ margin: "5px 0", fontSize: 13, color: "#666" }}>
            P.O. BOX: 51200, Dubai, U.A.E
          </p>
          <h1 style={{ marginTop: 15, fontSize: 22, color: "#8b0000", fontWeight: "bold" }}>
            Christ Experience
          </h1>
          <h2 style={{ margin: "8px 0", fontSize: 18, color: "#6c3483" }}>
            Christeen Retreat 2025
          </h2>
          <p style={{ fontSize: 13, fontStyle: "italic" }}>By Marian Ministry</p>
          <p style={{ fontSize: 13, marginTop: 5 }}>(December 20th to 25th)</p>
        </div>

        {/* Buttons Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "15px",
              fontSize: "18px",
              fontWeight: "bold",
              border: "none",
              borderRadius: "50px",
              cursor: "pointer",
              background: "linear-gradient(90deg, #f05a28, #e94e77)",
              color: "#fff",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Register
          </button>

          <button
            onClick={() => navigate("/volunteer-register")}
            style={{
              padding: "15px",
              fontSize: "18px",
              fontWeight: "bold",
              border: "none",
              borderRadius: "50px",
              cursor: "pointer",
              background: "linear-gradient(90deg, #3498db, #2ecc71)",
              color: "#fff",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Volunteer Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
