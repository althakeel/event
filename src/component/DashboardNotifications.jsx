import React, { useEffect, useState, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const Notification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div style={{
      position: "fixed",
      top: 20,
      right: 20,
      backgroundColor: "#6c3483",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: 8,
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      zIndex: 1000,
      fontWeight: 600
    }}>
      {message}
    </div>
  );
};

const DashboardNotifications = () => {
  const [users, setUsers] = useState([]);
  const [notification, setNotification] = useState("");
  const prevUsersRef = useRef([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const updatedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const prevUsers = prevUsersRef.current;

      // New registration
      if (updatedUsers.length > prevUsers.length) {
        setNotification("📌 New user registered!");
      }

      // Online status or break changes
      updatedUsers.forEach((user) => {
        const prevUser = prevUsers.find(u => u.id === user.id);
        if (!prevUser) return;

        if (!prevUser.inSession && user.inSession) {
          setNotification(`🟢 ${user.participantName} is now online`);
        }

        const prevBreaks = prevUser.breaks?.length || 0;
        const currBreaks = user.breaks?.length || 0;
        if (currBreaks > prevBreaks) {
          const lastBreak = user.breaks[currBreaks - 1];
          setNotification(`☕ ${user.participantName} ${lastBreak.type === "out" ? "started break" : "ended break"}`);
        }
      });

      setUsers(updatedUsers);
      prevUsersRef.current = updatedUsers; // update the ref
    });

    return () => unsubscribe();
  }, []); // run only once

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Dashboard</h1>
      <p>Monitor user activity and attendance in real-time.</p>

      <Notification message={notification} onClose={() => setNotification("")} />

      <ul>
        {users.map(u => (
          <li key={u.id}>
            {u.participantName} - {u.inSession ? "Online" : "Offline"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardNotifications;
