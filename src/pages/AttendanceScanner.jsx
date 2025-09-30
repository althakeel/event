import React, { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const AttendanceScanner = () => {
  const [scannerStarted, setScannerStarted] = useState(false);
  const [student, setStudent] = useState(null);
  const [status, setStatus] = useState("");
  const scannerRef = useRef(null);
  const lastScannedRef = useRef("");

  const handleScanSuccess = async (decodedText) => {
    const trimmedData = decodedText.trim();
    if (trimmedData === lastScannedRef.current) return;
    lastScannedRef.current = trimmedData;

    const q = query(collection(db, "users"), where("generatedId", "==", trimmedData));
    const querySnap = await getDocs(q);
    if (querySnap.empty) return;

    const studentDoc = querySnap.docs[0];
    const studentData = studentDoc.data();
    setStudent(studentData);

    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();

    let currentStatus = "";
    let updateData = {};

    if (minutes < 570) { // Before 9:30 AM
      currentStatus = "Sign-In";
      updateData = { signIn: serverTimestamp() };
    } else if (minutes >= 960) { // After 4:00 PM
      currentStatus = "Sign-Out";
      updateData = { signOut: serverTimestamp() };
    } else { // Break logic
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

    setStatus(currentStatus);
    await updateDoc(doc(db, "users", studentDoc.id), updateData);
  };

  const startScanner = () => {
    if (scannerStarted) return;
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;
    scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, handleScanSuccess);
    setScannerStarted(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => scannerRef.current.clear());
      setScannerStarted(false);
    }
  };

  return (
    <div>
      <div id="qr-reader" style={{ width: 320, height: 320 }}></div>
      <button onClick={startScanner}>Start</button>
      <button onClick={stopScanner}>Stop</button>
      {student && <p>{student.participantName} - Status: {status}</p>}
    </div>
  );
};

export default AttendanceScanner;
