// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzjVeQj1hIel-Jbp6nFwu7vFI_pIz9mpU",
  authDomain: "acl-recovery-tracker.firebaseapp.com",
  projectId: "acl-recovery-tracker",
  storageBucket: "acl-recovery-tracker.firebasestorage.app",
  messagingSenderId: "254838271577",
  appId: "1:254838271577:web:7221d9a2b1dc581fd00b48",
  measurementId: "G-N3TS5CLWEZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);