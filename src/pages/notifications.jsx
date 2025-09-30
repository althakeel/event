import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const Notifications = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  ); // Default today
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const allEvents = [];

      snapshot.docs.forEach((doc) => {
        const user = { id: doc.id, ...doc.data() };
        const dateFormat = (d) => d?.toDate?.()?.toISOString()?.slice(0, 10);

        // 1️⃣ New registration
        const createdDate = user.createdAt ? dateFormat(user.createdAt) : null;
        if (createdDate === selectedDate) {
          allEvents.push({
            name: user.participantName,
            type: "New Registration",
            time: user.createdAt?.toDate().toLocaleTimeString(),
          });
        }

        // 2️⃣ Session history
        if (user.sessionHistory) {
          user.sessionHistory.forEach((s) => {
            const sDate = s.time.toDate().toISOString().slice(0, 10);
            if (sDate === selectedDate) {
              allEvents.push({
                name: user.participantName,
                type: s.type === "in" ? "Checked In" : "Checked Out",
                time: s.time.toDate().toLocaleTimeString(),
              });
            }
          });
        }

        // 3️⃣ Breaks
        if (user.breaks) {
          user.breaks.forEach((b) => {
            const bDate = b.time.toDate().toISOString().slice(0, 10);
            if (bDate === selectedDate) {
              allEvents.push({
                name: user.participantName,
                type: b.type === "out" ? "Break Out" : "Break In",
                time: b.time.toDate().toLocaleTimeString(),
              });
            }
          });
        }
      });

      // Sort by time
      allEvents.sort((a, b) => new Date(a.time) - new Date(b.time));
      setEvents(allEvents);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const getEventColor = (type) => {
    switch (type) {
      case "New Registration": return "#27ae60"; // green
      case "Checked In": return "#2980b9"; // blue
      case "Checked Out": return "#c0392b"; // red
      case "Break In": return "#f39c12"; // orange
      case "Break Out": return "#d35400"; // darker orange
      default: return "#7f8c8d"; // grey
    }
  };

  // Filtered events based on search and type
  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "All" || e.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", minHeight: "100vh", background: "#f4f6f8" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Notifications</h2>

      {/* Controls */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 15,
        marginBottom: 30
      }}>
        {/* Date picker */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
            minWidth: 150,
          }}
        />

        {/* Search */}
        <input
          type="text"
          placeholder="Search student..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
            minWidth: 200,
          }}
        />

        {/* Event type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
            minWidth: 180,
          }}
        >
          <option value="All">All Events</option>
          <option value="New Registration">New Registration</option>
          <option value="Checked In">Checked In</option>
          <option value="Checked Out">Checked Out</option>
          <option value="Break In">Break In</option>
          <option value="Break Out">Break Out</option>
        </select>
      </div>

      {/* Events List */}
      <div style={{ display: "grid", gap: 15 }}>
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888", padding: 50, fontSize: 16 }}>
            No events for this date
          </div>
        ) : (
          filteredEvents.map((e, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#fff",
                padding: "15px 20px",
                borderRadius: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                borderLeft: `5px solid ${getEventColor(e.type)}`,
                transition: "transform 0.2s",
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: 16 }}>{e.name}</h4>
                <p style={{ margin: "5px 0 0 0", color: getEventColor(e.type), fontWeight: 600 }}>
                  {e.type}
                </p>
              </div>
              <div style={{ color: "#555", fontWeight: 500 }}>{e.time}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
