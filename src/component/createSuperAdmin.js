import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const SUPERADMIN_EMAIL = "info@squarecom.ae";
const SUPERADMIN_PASSWORD = "Sagar143s";

const createSuperAdmin = async () => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, SUPERADMIN_EMAIL);

    if (methods.length === 0) {
      // User doesn't exist → create superadmin
      const userCred = await createUserWithEmailAndPassword(auth, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD);
      const uid = userCred.user.uid;

      await setDoc(doc(db, "users", uid), {
        email: SUPERADMIN_EMAIL,
        role: "superadmin"
      });

      console.log("Superadmin created successfully!");
    } else {
      console.log("Superadmin already exists.");
    }
  } catch (err) {
    console.error("Superadmin creation error:", err);
  }
};

createSuperAdmin();
