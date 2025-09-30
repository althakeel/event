import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

// Logos
import Logo from "../images/bcst.jpeg";
import Logo2 from "../images/logo.jpg";
import Logo3 from "../images/logo2.png";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    participantName: "",
    dob: "",
    age: "",
    category: "",
    categoryColor: "",
    fatherName: "",
    motherName: "",
    contactHome: "",
    contactFatherOffice: "",
    contactFatherMobile: "",
    contactMotherOffice: "",
    contactMotherMobile: "",
    email: "",
    residence: "",
    parentAgreement: false,
    parentSignature: "",
    medicalConditions: [],
    otherCondition: "",
    medicalNotes: "",
  });

  // Auto age calculation & category assignment
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let ageNow = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) ageNow--;

      let category = "";
      let categoryColor = "";
      if (ageNow >= 8 && ageNow <= 12) {
        category = "Junior";
        categoryColor = "red";
      } else if (ageNow >= 13 && ageNow <= 19) {
        category = "Senior";
        categoryColor = "blue";
      }

      setFormData((prev) => ({
        ...prev,
        age: ageNow.toString(),
        category,
        categoryColor,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        age: "",
        category: "",
        categoryColor: "",
      }));
    }
  }, [formData.dob]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleMedicalCondition = (cond) => {
    setFormData((prev) => {
      const exists = prev.medicalConditions.includes(cond);
      const updatedConditions = exists
        ? prev.medicalConditions.filter((c) => c !== cond)
        : [...prev.medicalConditions, cond];
      return { ...prev, medicalConditions: updatedConditions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"), limit(1));
      const snap = await getDocs(q);

      let lastNumber = 0;
      snap.forEach((doc) => {
        const lastId = doc.data()?.studentId;
        if (lastId) lastNumber = parseInt(lastId.replace("STU-", "")) || 0;
      });

      const newStudentId = `STU-${String(lastNumber + 1).padStart(3, "0")}`;
      const dataToSave = {
        ...formData,
        studentId: newStudentId,
        createdAt: new Date(),
      };

      const docRef = await addDoc(usersRef, dataToSave);
      const dataWithId = { ...dataToSave, docId: docRef.id };

      navigate("/id-card", { state: { formData: dataWithId } });
    } catch (err) {
      console.error("Error submitting registration:", err);
      alert("❌ Failed to submit registration. Please try again.");
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(to bottom, #fdfcfb, #f4ede2)",
        padding: 20,
        width: "100%",
      }}
    >
      {/* Floating Login Button */}
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999 }}>
        <button
          onClick={() => navigate("/volunteer-register")}
          style={{
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: "600",
            backgroundColor: "#2980b9",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          Register Volunteer
        </button>
      </div>

      <Header />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 10px" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 850,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 25,
          }}
        >
          {/* Participant Info */}
          <Card title="👦 Participant Information">
            <Input
              label="Participant's Name (CAPITALS)"
              name="participantName"
              value={formData.participantName}
              onChange={handleChange}
              required
            />
            <Row>
              <Input
                label="Date of Birth"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
              <Input
                label="Age (auto)"
                type="text"
                name="age"
                value={formData.age}
                readOnly
              />
            </Row>
<CategoryDisplay age={formData.age} category={formData.category} />          </Card>

          {/* Parent Info */}
          <Card title="👨‍👩‍👧 Parent Information">
            <Row>
              <Input
                label="Father’s Name"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
              />
              <Input
                label="Mother’s Name"
                name="motherName"
                value={formData.motherName}
                onChange={handleChange}
              />
            </Row>
          </Card>

          {/* Contact Details */}
          <Card title="📞 Contact Details">
            <Input
              label="Home Contact"
              name="contactHome"
              value={formData.contactHome}
              onChange={handleChange}
            />
            <Row>
              <Input
                label="Father - Office"
                name="contactFatherOffice"
                value={formData.contactFatherOffice}
                onChange={handleChange}
              />
              <Input
                label="Father - Mobile"
                name="contactFatherMobile"
                value={formData.contactFatherMobile}
                onChange={handleChange}
              />
            </Row>
            <Row>
              <Input
                label="Mother - Office"
                name="contactMotherOffice"
                value={formData.contactMotherOffice}
                onChange={handleChange}
              />
              <Input
                label="Mother - Mobile"
                name="contactMotherMobile"
                value={formData.contactMotherMobile}
                onChange={handleChange}
              />
            </Row>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Residence Location"
              name="residence"
              value={formData.residence}
              onChange={handleChange}
            />
          </Card>

          {/* Medical Info */}
          <Card title="🩺 Medical Information">
            <p style={{ fontSize: 14, marginBottom: 10 }}>
              Please indicate any conditions (check all that apply):
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 15, marginBottom: 15 }}>
              {["N/A", "Asthma", "Diabetes", "Allergies", "Epilepsy", "Other"].map(
                (cond) => (
                  <label key={cond} style={{ fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={formData.medicalConditions.includes(cond)}
                      onChange={() => handleMedicalCondition(cond)}
                    />{" "}
                    {cond}
                  </label>
                )
              )}
            </div>
            {formData.medicalConditions.includes("Other") && (
              <Input
                label="Specify other condition"
                name="otherCondition"
                value={formData.otherCondition}
                onChange={handleChange}
              />
            )}
            <label style={{ fontWeight: "600", display: "block", marginBottom: 6, fontSize: 14 }}>
              Additional Medical Notes
            </label>
            <textarea
              name="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleChange}
              placeholder="Write N/A if none"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
                minHeight: 80,
              }}
            />
          </Card>

          {/* Agreement */}
          <Card title="🙏 Parent Agreement">
            <label style={{ fontSize: 14, display: "block", marginBottom: 12 }}>
              <input
                type="checkbox"
                name="parentAgreement"
                checked={formData.parentAgreement}
                onChange={handleChange}
                required
              />{" "}
              I agree to bring and collect my child.
            </label>
            <Input
              label="Signature of Parent"
              name="parentSignature"
              value={formData.parentSignature}
              onChange={handleChange}
            />
          </Card>

          <ImportantNotes />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: 14,
              fontSize: 15,
              fontWeight: "600",
              backgroundColor: "#6c3483",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              marginTop: 10,
            }}
          >
            ✨ Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
};

/* ---------------- Helper Components ---------------- */

const Header = () => (
  <div
    style={{
      width: "100%",
      background: "rgba(255,255,255,0.9)",
      borderTop: "6px solid #6c3483",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      marginBottom: 35,
    }}
  >
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        borderRadius: 12,
      }}
    >
      <div style={{ textAlign: "center", flex: "1 1 150px" }}>
        <img src={Logo2} alt="Logo2" style={{ maxWidth: 120, marginBottom: 5 }} />
        <img src={Logo3} alt="Logo3" style={{ maxWidth: 120 }} />
      </div>
      <div style={{ flex: "2 1 300px", textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20, color: "#2c3e50", textTransform: "uppercase" }}>
          Malayalee Catholic Community
        </h2>
        <h3 style={{ margin: "5px 0", fontSize: 16, color: "#555" }}>
          St. Mary’s Church, Dubai
        </h3>
        <p style={{ margin: "5px 0", fontSize: 13, color: "#666" }}>
          P.O. BOX: 51200, Dubai, U.A.E
        </p>
        <h1 style={{ marginTop: 15, fontSize: 22, color: "#8b0000", fontWeight: "bold" }}>
          Christ Experience
        </h1>
        <h2 style={{ margin: "8px 0", fontSize: 18, color: "#6c3483" }}>
          Christeen Retreat 2025
        </h2>
        <p style={{ fontSize: 13, fontStyle: "italic" }}>By Marian Ministry</p>
        <p style={{ fontSize: 13, marginTop: 5 }}>(December 20th to 25th)</p>
      </div>
      <div style={{ textAlign: "center", flex: "1 1 150px" }}>
        <img src={Logo} alt="Logo" style={{ maxWidth: 130 }} />
      </div>
    </div>
  </div>
);

const Row = ({ children }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 20,            // horizontal gap between inputs
      marginBottom: 20,    // vertical gap after row
    }}
  >
    {children}
  </div>
);


const Input = ({ label, type = "text", ...props }) => (
  <div style={{ flex: 1, minWidth: 250, marginBottom: 10 }}> {/* vertical gap */}
    <label
      style={{
        fontWeight: "600",
        marginBottom: 6,
        display: "block",
        fontSize: 14,
      }}
    >
      {label}
    </label>
    <input
      type={type}
      {...props}
      style={{
        width: "100%",
        padding: 10,
        borderRadius: 8,
        border: "1px solid #ddd",
        fontSize: 14,
        boxSizing: "border-box",
      }}
      onFocus={(e) => (e.target.style.border = "1px solid #6c3483")}
      onBlur={(e) => (e.target.style.border = "1px solid #ddd")}
    />
  </div>
);

const CategoryDisplay = ({ age, category }) => (
  <div style={{ marginTop: 15 }}>
    <label
      style={{
        fontWeight: "600",
        marginBottom: 6,
        display: "block",
        fontSize: 14,
      }}
    >
      Category 
    </label>
    <div style={{ fontSize: 14, padding: 8, border: "1px solid #ddd", borderRadius: 8, background: "#f8f8f8", width: 200 }}>
      {age
        ? `${category} (${category === "Junior" ? "8–12" : "13–18"})`
        : "Enter Date of Birth to see category"}
    </div>
  </div>
);


const Card = ({ title, children }) => (
  <div
    style={{
      background: "#fff",
      padding: 20,
      marginBottom: 25,
      borderRadius: 12,
      boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      borderLeft: "4px solid #6c3483",
    }}
  >
    <h3
      style={{
        marginBottom: 15,
        fontSize: 16,
        color: "#6c3483",
        borderBottom: "1px solid #eee",
        paddingBottom: 6,
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const CategoryRadio = ({ formData, handleChange }) => (
  <div style={{ marginTop: 15 }}>
    <label style={{ fontWeight: "600", marginBottom: 6, display: "block", fontSize: 14 }}>
      Category
    </label>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
      {["Junior", "Senior"].map((cat) => (
        <label key={cat} style={{ fontSize: 14 }}>
          <input
            type="radio"
            name="category"
            value={cat}
            checked={formData.category === cat}
            onChange={handleChange}
          />{" "}
          {cat} {cat === "Junior" ? "(8–12)" : "(13–18)"}
        </label>
      ))}
    </div>
  </div>
);

const ImportantNotes = () => (
  <Card title="⚠️ Important Notes">
    <ul style={{ fontSize: 14, lineHeight: 1.6, paddingLeft: 18 }}>
      <li>All participants must have parental consent.</li>
      <li>Medical info must be accurate; carry necessary medications.</li>
      <li>Registration is confirmed only after submission of this form, along with the fee of Dhs.100/- at the Office of the Spiritual Director Fr Alex.</li>
      <li>Age Category: JUNIORS - 8 to 12 Years / SENIORS – 13 to 18 Years.</li>
      <li>Drop-off at 8:15 AM and pick-up at 5:15 PM from the entrance of Main Hall.</li>
      <li>Please carry your ID badge every day.</li>
      <li>Transportation will not be provided; parents are responsible for bringing and collecting their child.</li>
      <li>Please bring Bible, notebook, pen; food will be served.</li>
      <li>Mobile phones are strictly not allowed during the session.</li>
      <li>For any further information or queries, please contact Christeen team members:</li>
      <ul style={{ fontSize: 14, lineHeight: 1.6, paddingLeft: 18, listStyleType: "circle" }}>
        <li>Shaji Joseph: 055 7339724</li>
        <li>Jyotish: 056 9916400</li>
      </ul>
    </ul>
  </Card>
);


export default Register;
