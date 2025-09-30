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
  const [history, setHistory] = useState([]); // All scanned users (found or not)
  const scannerRef = useRef(null);
  const lastScannedRef = useRef("");

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  const handleScanSuccess = async (decodedText) => {
    if (!decodedText) return;

    // Normalize QR string
    const scannedId = decodedText.replace(/\s/g, '').trim().toLowerCase();

    // Avoid scanning the same ID twice in a row
    if (scannedId === lastScannedRef.current) return;
    lastScannedRef.current = scannedId;

    try {
      const q = query(collection(db, "users"), where("generatedIdLowercase", "==", scannedId));
      const querySnap = await getDocs(q);

      let newEntry;
      if (querySnap.empty) {
        // User not found
        newEntry = {
          participantName: "User not found",
          generatedId: scannedId,
          status: "-",
          time: new Date().toLocaleTimeString(),
        };
      } else {
        const studentDoc = querySnap.docs[0];
        const studentData = studentDoc.data();

        // Determine attendance status
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

      // Add entry to history (found or not)
      setHistory(prev => [newEntry, ...prev]);

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
        { fps: 10, qrbox: { width: Math.min(window.innerWidth * 0.8, 300), height: Math.min(window.innerWidth * 0.8, 300) }, disableFlip: false },
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
    <div style={{ textAlign: "center", padding: 10 }}>
      <div
        id="qr-reader"
        style={{ width: "90vw", maxWidth: 360, height: "90vw", maxHeight: 360, margin: "0 auto", border: "2px solid #ccc", borderRadius: 10 }}
      ></div>

      <div style={{ marginTop: 20, maxHeight: 300, overflowY: "auto" }}>
        {history.map((item, index) => (
          <div key={index} style={{ marginBottom: 10, padding: 10, borderRadius: 10, backgroundColor: "#f5f5f5", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", textAlign: "left" }}>
            <p style={{ margin: 0, fontWeight: "bold" }}>{item.participantName}</p>
            <p style={{ margin: 0 }}>ID: {item.generatedId}</p>
            <p style={{ margin: 0 }}>Status: {item.status}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#555" }}>{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceScanner;
