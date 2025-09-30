// src/components/AdminLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fetchSignInMethodsForEmail 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; 
import Bg from "../images/devotional-john.webp";

// Superadmin credentials
const SUPERADMIN_EMAIL = "info@squarecom.ae";
const SUPERADMIN_PASSWORD = "Sagar143s";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Auto-create superadmin on component mount
  useEffect(() => {
    const createSuperAdmin = async () => {
      try {
        const methods = await fetchSignInMethodsForEmail(auth, SUPERADMIN_EMAIL);

        if (methods.length === 0) {
          // Create superadmin in Auth
          const userCred = await createUserWithEmailAndPassword(auth, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD);
          const uid = userCred.user.uid;

          // Add role in Firestore
          await setDoc(doc(db, "users", uid), {
            email: SUPERADMIN_EMAIL,
            role: "superadmin"
          });

          console.log("Superadmin created successfully!");
        } else {
          console.log("Superadmin already exists.");
        }
      } catch (err) {
        console.error("Superadmin creation error:", err.message);
      }
    };

    createSuperAdmin();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      // Sign in with Firebase Auth
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // Get role from Firestore
      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        alert("No role found for this user. Access denied.");
        return;
      }

      const role = userDoc.data().role;

      // Redirect based on role
      if (role === "superadmin") {
        navigate("/super-admin-dashboard");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        alert("Unauthorized access.");
      }

    } catch (err) {
      console.error(err);
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Login</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" },
  background: { position: "absolute", inset: 0, backgroundImage: `url(${Bg})`, backgroundSize: "cover", opacity: 0.2, zIndex: -1 },
  card: { backgroundColor: "#fff", padding: "40px 30px", borderRadius: 12, boxShadow: "0 8px 25px rgba(0,0,0,0.15)", maxWidth: 400, textAlign: "center" },
  title: { marginBottom: 20, fontSize: 24, fontWeight: "bold" },
  form: { display: "flex", flexDirection: "column", gap: 15 },
  input: { padding: 14, fontSize: 16, borderRadius: 8, border: "1px solid #ccc" },
  button: { padding: 14, fontSize: 16, fontWeight: "bold", backgroundColor: "#2980b9", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
};

export default AdminLogin;
