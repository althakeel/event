import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const AttendanceTable = () => {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendanceData, setAttendanceData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name or status

  // Fetch attendance from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "attendance"), (snapshot) => {
      const data = {};
      snapshot.docs.forEach((doc) => {
        const { date, studentName, status } = doc.data();
        if (!data[date]) data[date] = [];
        data[date].push({ name: studentName, status });
      });
      setAttendanceData(data);
    });
    return () => unsubscribe();
  }, []);

  // Unique students
  const allStudents = Array.from(
    new Set(Object.values(attendanceData).flat().map((s) => s.name))
  );

  // Student summary
  const calculateSummary = (studentName) => {
    let total = 0,
      present = 0;
    Object.values(attendanceData).forEach((day) =>
      day.forEach((s) => {
        if (s.name === studentName) {
          total++;
          if (s.status === "Present") present++;
        }
      })
    );
    return {
      totalClasses: total,
      attended: present,
      absent: total - present,
      percentage: total > 0 ? ((present / total) * 100).toFixed(1) : "0",
    };
  };

  // Filter & map
  const filteredStudents = allStudents
    .filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map((name) => {
      const summary = calculateSummary(name);
      const dayData = attendanceData[selectedDate] || [];
      const student = dayData.find((s) => s.name === name);
      return {
        name,
        status: student ? student.status : "Absent",
        summary,
      };
    });

  // Sort
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "status") return a.status.localeCompare(b.status);
    return 0;
  });

  // Split Present / Absent
  const presentList = sortedStudents.filter((s) => s.status === "Present");
  const absentList = sortedStudents.filter((s) => s.status === "Absent");

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: 15,
        background: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: 24,
          marginBottom: 20,
        }}
      >
        Student Attendance
      </h1>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 14,
            flex: "1 1 120px",
            cursor: "pointer",
          }}
        />
        <input
          type="text"
          placeholder="Search student..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 14,
            flex: "1 1 150px",
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 14,
            flex: "1 1 120px",
          }}
        >
          <option value="name">Sort by Name</option>
          <option value="status">Sort by Status</option>
        </select>
      </div>

      {/* Attendance Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            minWidth: 700,
          }}
        >
          <thead>
            <tr
              style={{
                background: "#4CAF50",
                color: "#fff",
                textAlign: "center",
              }}
            >
              <th style={{ padding: 10, fontSize: 12 }}>SL No</th>
              <th style={{ padding: 10, fontSize: 12 }}>Student Name</th>
              <th style={{ padding: 10, fontSize: 12 }}>Status</th>
              <th style={{ padding: 10, fontSize: 12 }}>Total</th>
              <th style={{ padding: 10, fontSize: 12 }}>Attended</th>
              <th style={{ padding: 10, fontSize: 12 }}>Absent</th>
              <th style={{ padding: 10, fontSize: 12 }}>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {[...presentList, ...absentList].map((s, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: 6, textAlign: "center", fontSize: 12 }}>
                  {idx + 1}
                </td>
                <td style={{ padding: 6, textAlign: "center", fontSize: 12 }}>
                  {s.name}
                </td>
                <td
                  style={{
                    padding: 6,
                    textAlign: "center",
                    color: s.status === "Present" ? "green" : "red",
                    fontWeight: 500,
                    fontSize: 12,
                  }}
                >
                  {s.status}
                </td>
                <td style={{ padding: 6, textAlign: "center", fontSize: 12 }}>
                  {s.summary.totalClasses}
                </td>
                <td
                  style={{
                    padding: 6,
                    textAlign: "center",
                    color: "green",
                    fontWeight: 500,
                    fontSize: 12,
                  }}
                >
                  {s.summary.attended}
                </td>
                <td
                  style={{
                    padding: 6,
                    textAlign: "center",
                    color: "red",
                    fontWeight: 500,
                    fontSize: 12,
                  }}
                >
                  {s.summary.absent}
                </td>
                <td style={{ padding: 6, textAlign: "center", fontSize: 12 }}>
                  {s.summary.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile styles */}
      <style>
        {`
          @media (max-width: 768px) {
            table th, table td {
              padding: 6px 4px;
              font-size: 11px;
            }
          }
          @media (max-width: 480px) {
            table th, table td {
              padding: 4px 2px;
              font-size: 10px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AttendanceTable;
