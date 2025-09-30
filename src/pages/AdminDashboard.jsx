import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { FaUserPlus, FaSignInAlt, FaSignOutAlt, FaCoffee, FaUsers } from "react-icons/fa";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // Fetch all users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    });

    // Fetch today's attendance
    const unsubscribeAttendance = onSnapshot(
      query(collection(db, "attendance"), where("date", "==", today)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        setAttendanceData(data);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeAttendance();
    };
  }, []);

  // Stats calculations
  const totalRegisters = users.length;
  const sessionIn = users.filter(u => u.inSession).length;
  const sessionOut = users.filter(u => !u.inSession).length;
  const totalBreaks = users.reduce((sum, u) => sum + (u.breaks?.length || 0), 0);
  const todayPresent = attendanceData.filter(a => a.status === "Present").length;
  const todayAbsent = attendanceData.filter(a => a.status === "Absent").length;

  const presentNames = attendanceData.filter(a => a.status === "Present").map(a => a.studentName).join(", ") || "-";
  const absentNames = attendanceData.filter(a => a.status === "Absent").map(a => a.studentName).join(", ") || "-";

  // Weekly login chart (dummy example)
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Logins",
        data: [12, 19, 14, 17, 22, 15, 20], // You can calculate weekly login from Firebase
        backgroundColor: "#2980b9",
        borderRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Weekly Login Activity", font: { size: 18 } }
    },
    scales: { y: { beginAtZero: true } }
  };

  const stats = [
    { title: "Total Registers", value: totalRegisters, icon: <FaUserPlus />, color: "#2980b9" },
    { title: "Session In", value: sessionIn, icon: <FaSignInAlt />, color: "#27ae60" },
    { title: "Session Out", value: sessionOut, icon: <FaSignOutAlt />, color: "#c0392b" },
    { title: "Breaks Taken", value: totalBreaks, icon: <FaCoffee />, color: "#f39c12" },
    { title: "Today's Present", value: todayPresent, icon: <FaUsers />, color: "#8e44ad" },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Dashboard</h2>

      {/* Stats Cards */}
      <div style={styles.grid}>
        {stats.map(stat => (
          <div key={stat.title} style={{ ...styles.card, borderLeft: `5px solid ${stat.color}` }}>
            <div style={styles.icon}>{stat.icon}</div>
            <div>
              <h3 style={styles.cardTitle}>{stat.title}</h3>
              <p style={styles.cardValue}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today’s Attendance Summary */}
      <div style={styles.summary}>
        <p><strong>Today's Attendance:</strong></p>
        <p>Present ({todayPresent}): {presentNames}</p>
        <p>Absent ({todayAbsent}): {absentNames}</p>
      </div>

      {/* Chart */}
      <div style={styles.chartContainer}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", flexDirection: "column", gap: 20, fontFamily: "Arial, sans-serif", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 15 },
  card: { display: "flex", alignItems: "center", gap: 10, backgroundColor: "#fff", padding: 15, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)", transition: "transform 0.2s" },
  cardTitle: { fontSize: 14, color: "#555", margin: 0 },
  cardValue: { fontSize: 18, fontWeight: "bold", margin: 0 },
  icon: { fontSize: 24, padding: 8, borderRadius: 50, backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" },
  summary: { background: "#fff", padding: 15, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
  chartContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.1)", height: 300 },
};

export default AdminDashboard;
