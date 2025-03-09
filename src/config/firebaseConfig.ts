// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUhj0m3o2gf187fsRuYVPd0iA28xtadhk",
  authDomain: "visualization-8f7a2.firebaseapp.com",
  projectId: "visualization-8f7a2",
  storageBucket: "visualization-8f7a2.firebasestorage.app",
  messagingSenderId: "441896586198",
  appId: "1:441896586198:web:0ea9f70076053f00eb7277",
  measurementId: "G-G0J87BEPZL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
