import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { toPng } from "html-to-image";
import Logo from "../images/bcst.jpeg";

const IDCard = () => {
  const { state } = useLocation();
  const cardRef = useRef();

  if (!state) return <p>No user data found!</p>;

  const handleDownload = () => {
    if (!cardRef.current) return;
    toPng(cardRef.current)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `${state.participantName}_ID.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.error("Error generating image:", err));
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
      <div
        ref={cardRef}
        style={{
          width: 400,
          padding: 20,
          border: "2px solid #6c3483",
          borderRadius: 12,
          textAlign: "center",
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {/* Logo */}
        <img
          src={Logo}
          alt="Logo"
          style={{ maxWidth: 100, marginBottom: 10 }}
        />

        {/* Name */}
        <h2 style={{ margin: 5, color: "#6c3483" }}>
          {state.participantName}
        </h2>

        {/* ID */}
        <p style={{ margin: 5, fontWeight: "bold" }}>ID: {state.userId}</p>

        {/* QR Code */}
        <div style={{ marginTop: 20 }}>
          <QRCodeCanvas value={state.userId} size={150} />
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "#6c3483",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Download ID
        </button>
      </div>
    </div>
  );
};

export default IDCard;
