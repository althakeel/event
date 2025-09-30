import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Bgimage from "../images/devotional-john.webp";
import { auth } from "../firebase"; 
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from "firebase/auth";

const countryCodes = [
  "+1", "+44", "+971", "+91", "+61", "+81", "+49", "+33", "+39",
  "+55", "+7", "+86", "+27", "+82", "+34", "+47", "+46", "+41",
  "+31", "+351", "+64", "+63", "+62", "+66", "+48", "+20", "+354",
  "+358", "+90", "+380", "+52", "+60", "+966"
];

const Login = () => {
  const [method, setMethod] = useState("email");
  const [countryCode, setCountryCode] = useState("+971");
  const [value, setValue] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [emailStep, setEmailStep] = useState("enter"); // "enter" | "password"
  const navigate = useNavigate();

  const validateInput = () => {
    if (!value.trim()) return false;
    if (method === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (method === "phone") return /^\d{5,15}$/.test(value);
    return false;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateInput()) {
      alert(method === "email" ? "Please enter a valid email address" : "Please enter a valid phone number");
      return;
    }

    if (method === "phone") {
      // Phone login
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );
      try {
        const phoneNumber = `${countryCode}${value}`;
        const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
        setConfirmationResult(result);
        setOtpSent(true);
        alert("OTP sent to your phone!");
      } catch (err) {
        console.error(err);
        alert("Failed to send OTP. Try again.");
      }
    } else {
      // Email login
      try {
        const methods = await fetchSignInMethodsForEmail(auth, value);
        if (methods.length === 0) {
          alert("No user found with this email address.");
          return;
        }
        await sendPasswordResetEmail(auth, value);
        alert("Password reset link sent to your email! You can also log in with your password below.");
        setEmailStep("password");
      } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
      }
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!value || !password) {
      alert("Enter both email and password");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, value, password);
      alert("Email login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid email or password");
    }
  };

  const handleOtpChange = (digit, index) => {
    if (!/^\d*$/.test(digit)) return;
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    if (!digit && index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    if (otp.join("").length !== 6) {
      alert("Please enter the full 6-digit OTP");
      return;
    }
    if (confirmationResult) {
      try {
        await confirmationResult.confirm(otp.join(""));
        alert("Phone login successful!");
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        alert("Invalid OTP");
      }
    }
  };

  const handleRegister = () => navigate("/register");

  return (
    <div style={styles.page}>
      <div style={styles.background}></div>
      <div style={styles.card}>
        <h2 style={styles.title}>Christ Experience</h2>
        <p style={styles.subtitle}>Login to continue</p>

        {/* Method switcher */}
        {!otpSent && emailStep === "enter" && (
          <div style={styles.methodWrapper}>
            {["email", "phone"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                style={{
                  ...styles.methodButton,
                  backgroundColor: method === m ? "#2980b9" : "#f0f0f0",
                  color: method === m ? "#fff" : "#333",
                }}
              >
                {m === "email" ? "Email" : "Phone"}
              </button>
            ))}
          </div>
        )}

        {/* Phone login */}
        {method === "phone" && !otpSent && (
          <form onSubmit={handleSendOtp} style={styles.form}>
            <div style={styles.phoneWrapper}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={styles.countrySelect}
              >
                {countryCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Phone number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={styles.phoneInput}
              />
            </div>
            <div id="recaptcha-container"></div>
            <button type="submit" style={styles.button}>Send OTP</button>
          </form>
        )}

        {method === "phone" && otpSent && (
          <form onSubmit={handleOtpLogin} style={styles.form}>
            <p style={styles.otpLabel}>Enter 6-digit OTP</p>
            <div style={styles.otpWrapper}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  style={styles.otpInput}
                />
              ))}
            </div>
            <button type="submit" style={styles.button}>Login</button>
          </form>
        )}

        {/* Email login */}
        {method === "email" && emailStep === "enter" && (
          <form onSubmit={handleSendOtp} style={styles.form}>
            <input
              type="email"
              placeholder="example@email.com"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={styles.emailInput}
            />
            <button type="submit" style={styles.button}>Send Login Link</button>
          </form>
        )}

        {method === "email" && emailStep === "password" && (
          <form onSubmit={handleEmailLogin} style={styles.form}>
            <input
              type="email"
              value={value}
              readOnly
              style={{ ...styles.emailInput, backgroundColor: "#eee" }}
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.emailInput}
            />
            <button type="submit" style={styles.button}>Login</button>
          </form>
        )}

        <p style={styles.registerText}>
          Don't have an account?{" "}
          <span style={styles.registerLink} onClick={handleRegister}>Register</span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { position: "relative", fontFamily: "Arial, sans-serif", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "0 10px" },
  background: { position: "absolute", inset: 0, backgroundImage: `url(${Bgimage})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.6, zIndex: -1 },
  card: { background: "#fff", padding: "35px 25px", borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", width: "100%", maxWidth: 420, maxHeight: "calc(100vh - 40px)", overflowY: "auto", textAlign: "center", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "bold", color: "#8b0000", marginBottom: 6 },
  subtitle: { fontSize: 16, color: "#34495e", marginBottom: 20 },
  methodWrapper: { display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 },
  methodButton: { flex: 1, padding: 12, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 14 },
  form: { display: "flex", flexDirection: "column", gap: 15 },
  emailInput: { padding: 16, fontSize: 18, borderRadius: 8, border: "1px solid #ddd", width: "100%", boxSizing: "border-box" },
  phoneWrapper: { display: "flex", gap: 8, alignItems: "center" },
  countrySelect: { padding: 12, fontSize: 16, borderRadius: 8, border: "1px solid #ddd", flexShrink: 0 },
  phoneInput: { padding: 16, fontSize: 18, borderRadius: 8, border: "1px solid #ddd", flex: 1 },
  button: { padding: 14, fontSize: 16, fontWeight: "bold", backgroundColor: "#2980b9", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
  otpLabel: { fontWeight: "bold", marginBottom: 10, color: "#333" },
  otpWrapper: { display: "flex", justifyContent: "center", gap: 10, marginBottom: 20 },
  otpInput: { width: "45px", height: "50px", fontSize: "20px", textAlign: "center", border: "1px solid #ccc", borderRadius: 8 },
  registerText: { fontSize: 14, color: "#333", marginTop: 15 },
  registerLink: { color: "#2980b9", cursor: "pointer", fontWeight: "bold" },
};

export default Login;
