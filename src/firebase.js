import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Add this


const firebaseConfig = {
  // Paste your config from Firebase Console here
  apiKey: "AIzaSyDILhYtlF73E3uJv6DcIZjMJ6FdbxrGXsU",
  authDomain: "health-bit-9ed05.firebaseapp.com",
  projectId: "health-bit-9ed05",
  storageBucket: "health-bit-9ed05.firebasestorage.app",
  messagingSenderId: "270028866454",
  appId: "1:270028866454:web:cdc68c8629811caf3313b7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // Export auth

/* // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDILhYtlF73E3uJv6DcIZjMJ6FdbxrGXsU",
  authDomain: "health-bit-9ed05.firebaseapp.com",
  databaseURL: "https://health-bit-9ed05-default-rtdb.firebaseio.com",
  projectId: "health-bit-9ed05",
  storageBucket: "health-bit-9ed05.firebasestorage.app",
  messagingSenderId: "270028866454",
  appId: "1:270028866454:web:cdc68c8629811caf3313b7",
  measurementId: "G-03ST3FWBM6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);*/