import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const AttendanceScanner = () => {
  const [history, setHistory] = useState([]); // All scanned users
  const scannerRef = useRef(null);
  const lastScannedRef = useRef("");

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  const handleScanSuccess = async (decodedText) => {
    if (!decodedText) return;

    const scannedId = decodedText.replace(/\s/g, "").trim().toLowerCase();

    // Avoid scanning same ID twice in a row
    if (scannedId === lastScannedRef.current) return;
    lastScannedRef.current = scannedId;

    try {
      // Adjust field name based on your Firestore document
      const q = query(
        collection(db, "users"),
        where("generatedIdLowercase", "==", scannedId) // Make sure this field exists in Firebase
      );
      const querySnap = await getDocs(q);

      let newEntry;
      if (querySnap.empty) {
        newEntry = {
          participantName: "User not found",
          generatedId: scannedId,
          status: "-",
          time: new Date().toLocaleTimeString(),
        };
      } else {
        const studentDoc = querySnap.docs[0];
        const studentData = studentDoc.data();

        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();

        let currentStatus = "";
        let updateData = {};

        if (minutes < 570) {
          currentStatus = "Sign-In";
          updateData = { signIn: serverTimestamp() };
        } else if (minutes >= 960) {
          currentStatus = "Sign-Out";
          updateData = { signOut: serverTimestamp() };
        } else {
          if (!studentData.breaks) studentData.breaks = [];
          const lastBreak = studentData.breaks[studentData.breaks.length - 1];
          if (!lastBreak || lastBreak.type === "in") {
            currentStatus = "Break Out";
            updateData = { breaks: arrayUnion({ type: "out", time: serverTimestamp() }) };
          } else {
            currentStatus = "Break In";
            updateData = { breaks: arrayUnion({ type: "in", time: serverTimestamp() }) };
          }
        }

        await updateDoc(doc(db, "users", studentDoc.id), updateData);

        newEntry = {
          ...studentData,
          status: currentStatus,
          time: now.toLocaleTimeString(),
        };
      }

      setHistory((prev) => [newEntry, ...prev]);
    } catch (err) {
      console.error("Scan error:", err);
    }
  };

  const startScanner = async () => {
    if (scannerRef.current) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 300, // fixed square box
          disableFlip: false,
        },
        handleScanSuccess
      );
    } catch (err) {
      console.error("Camera start failed:", err);
      alert("Camera permission denied or not available.");
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current) return;
    try {
      const state = scannerRef.current.getState();
      if (state === "STOPPED") return;
      await scannerRef.current.stop();
      await scannerRef.current.clear();
      scannerRef.current = null;
    } catch (err) {
      console.warn("Scanner stop error:", err);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Camera */}
      <div
        id="qr-reader"
        style={{
          width: "90vw",
          maxWidth: 360,
          height: 360, // fixed height to prevent overlay
          border: "2px solid #ccc",
          borderRadius: 10,
        }}
      ></div>

      {/* Table of scanned users */}
      <div style={{ marginTop: 20, width: "95%", maxWidth: 400, maxHeight: 300, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#eee" }}>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>ID</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Status</th>
              <th style={{ border: "1px solid #ccc", padding: 8 }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index} style={{ backgroundColor: index === 0 ? "#d4edda" : "white" }}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{item.participantName}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{item.generatedId}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{item.status}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceScanner;
