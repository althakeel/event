import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const Team = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsSnapshot = await getDocs(collection(db, "teams"));
        setTeams(teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const usersSnapshot = await getDocs(collection(db, "users"));
        setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Assign users to teams and filter by age 13–18
  const teamsWithMembers = teams
    .map(team => {
      const teamMembers = users
        .filter(user => user.teamId === team.id && user.age >= 13 && user.age <= 18)
        .sort((a, b) => a.age - b.age);
      return { ...team, members: teamMembers };
    })
    .filter(team => team.members.length > 0);

  // Apply search and status filter
  const filteredTeams = teamsWithMembers.filter(team => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.members.some(member =>
        member.participantName?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "online" && team.members.some(member => member.inSession)) ||
      (filterStatus === "offline" && team.members.every(member => !member.inSession));

    return matchesSearch && matchesFilter;
  });

  if (loading) return <p style={{ padding: 20 }}>Loading teams...</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Registered Teams (Ages 13–18)</h1>

      {/* Search + Filter */}
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search teams or members..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.filterButtons}>
          {["all", "online", "offline"].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                ...styles.filterButton,
                backgroundColor: filterStatus === status ? "#4CAF50" : "#ddd",
                color: filterStatus === status ? "#fff" : "#333"
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      <div style={styles.grid}>
        {filteredTeams.length === 0 ? (
          <p style={{ color: "#888" }}>No teams match your search/filter.</p>
        ) : (
          filteredTeams.map(team => {
            const onlineMembersCount = team.members.filter(m => m.inSession).length;

            // Group members by age
            const membersByAge = {};
            team.members.forEach(member => {
              if (!membersByAge[member.age]) membersByAge[member.age] = [];
              membersByAge[member.age].push(member);
            });

            return (
              <div key={team.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.teamName}>{team.name}</h2>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: onlineMembersCount > 0 ? "#4CAF50" : "#F44336"
                    }}
                  >
                    {onlineMembersCount > 0 ? "Online" : "Offline"}
                  </span>
                </div>

                <div>
                  <h3 style={styles.membersTitle}>Members:</h3>
                  {Object.keys(membersByAge)
                    .sort((a, b) => a - b)
                    .map(age => (
                      <div
                        key={age}
                        style={{
                          marginBottom: "15px",
                          padding: "10px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          backgroundColor: "#fefefe"
                        }}
                      >
                        <strong>Age {age}:</strong>
                        <ul style={styles.membersList}>
                          {membersByAge[age].map((member, idx) => (
                            <li key={idx} style={styles.memberItem}>
                              {member.participantName} — {member.inSession ? "🟢 Online" : "🔴 Offline"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ---------- Styles ----------
const styles = {
  container: { fontFamily: "Arial, sans-serif", padding: "30px", background: "#f9f9f9" },
  title: { fontSize: "30px", fontWeight: "700", marginBottom: "20px", color: "#333", textAlign: "center" },
  controls: { display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "25px", justifyContent: "center", alignItems: "center" },
  searchInput: { padding: "12px 15px", borderRadius: "25px", border: "1px solid #ccc", flex: "1", minWidth: "250px", fontSize: "16px", outline: "none", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
  filterButtons: { display: "flex", gap: "10px", flexWrap: "wrap" },
  filterButton: { padding: "10px 20px", borderRadius: "20px", border: "none", cursor: "pointer", fontWeight: "600", transition: "0.3s" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" },
  card: { backgroundColor: "#fff", borderRadius: "15px", padding: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  teamName: { fontSize: "22px", fontWeight: "700", color: "#333" },
  statusBadge: { padding: "5px 12px", borderRadius: "12px", color: "#fff", fontWeight: "600", fontSize: "14px" },
  membersTitle: { fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "#555" },
  membersList: { paddingLeft: "18px", margin: 0 },
  memberItem: { marginBottom: "5px", color: "#555" }
};

export default Team;
