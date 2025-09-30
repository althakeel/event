import React, { useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { toPng } from "html-to-image";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Logo from "../images/bcst.jpeg";

const IDCard = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const cardRef = useRef();
  const buttonRef = useRef();

  // Redirect if no registration data
  useEffect(() => {
    if (!state?.formData) navigate("/register");
  }, [state, navigate]);

  if (!state?.formData) return null;

  const { formData } = state;
  const userId = formData.studentId || "TEMP-ID";

  // Download ID Card as PNG and update Firestore
  const handleDownload = async () => {
    if (!cardRef.current) return;

    // Hide button while generating image
    if (buttonRef.current) buttonRef.current.style.display = "none";

    try {
      const dataUrl = await toPng(cardRef.current);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${formData.participantName || "Participant"}_ID.png`;
      link.click();

      // Save QR/ID info to Firestore
      if (formData.docId) {
        const userDocRef = doc(db, "users", formData.docId);
        await updateDoc(userDocRef, {
          idGenerated: true,
          idGeneratedAt: new Date(),
          generatedId: userId,
          qrValue: userId, // QR matches studentId
        });
        console.log("ID generation saved in Firestore");
      }
    } catch (err) {
      console.error("Error generating ID image:", err);
    } finally {
      if (buttonRef.current) buttonRef.current.style.display = "inline-block";
    }
  };

  return (
    <div style={styles.container}>
      <div ref={cardRef} style={styles.card}>
        {/* Logo & Organization Info */}
        <div style={styles.logoSection}>
          <img src={Logo} alt="Logo" style={styles.logo} />
          <h3 style={styles.organization}>Malayalee Catholic Community</h3>
          <p style={styles.subText}>St. Mary’s Church, Dubai</p>
          <p style={styles.subTextSmall}>P.O. BOX: 51200, Dubai, U.A.E</p>
        </div>

        {/* Participant Name */}
        <h2
          style={{
            ...styles.participantName,
            fontStyle: formData.medicalConditions?.length ? "italic" : "normal",
          }}
        >
          {formData.participantName || "Participant Name"}
        </h2>

        {/* Generated ID */}
        <p style={styles.idText}>ID: {userId}</p>

        {/* QR Code */}
        <div style={styles.qrCode}>
          <QRCodeCanvas value={userId} size={150} />
        </div>

        {/* Download Button */}
        <button ref={buttonRef} onClick={handleDownload} style={styles.button}>
          Download ID
        </button>
      </div>
    </div>
  );
};

// ---------- Styles ----------
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: 320,
    padding: 20,
    border: "2px solid #6c3483",
    borderRadius: 12,
    textAlign: "center",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  logoSection: {
    marginBottom: 12,
  },
  logo: {
    maxWidth: 80,
    marginBottom: 6,
  },
  organization: {
    margin: "4px 0",
    fontSize: 15,
    color: "#2c3e50",
  },
  subText: {
    margin: "2px 0",
    fontSize: 13,
    color: "#555",
  },
  subTextSmall: {
    margin: "2px 0",
    fontSize: 12,
    color: "#777",
  },
  participantName: {
    margin: 5,
    color: "#6c3483",
  },
  idText: {
    margin: 5,
    fontWeight: "bold",
  },
  qrCode: {
    marginTop: 20,
  },
  button: {
    marginTop: 20,
    padding: "10px 20px",
    background: "#6c3483",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};

export default IDCard;
