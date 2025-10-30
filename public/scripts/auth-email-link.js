import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getAuth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBXTdfKN9ZhC-INQVukxB7Twyh1trCZf8A",
  authDomain: "gathrify-644e8.firebaseapp.com",
  projectId: "gathrify-644e8",
  storageBucket: "gathrify-644e8.firebasestorage.app",
  messagingSenderId: "703401797587",
  appId: "1:703401797587:web:bacd2ac2439de36e54b126",
  measurementId: "G-R4NJGJJ34J"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Config for sending the sign-in link
const actionCodeSettings = {
  url: 'https://gathrify-644e8.firebaseapp.com/login.html', // Your login page URL
  handleCodeInApp: true,
};

const emailInput = document.getElementById("email-link-input");
const emailLinkBtn = document.getElementById("email-link-btn");

// Send email link
emailLinkBtn.addEventListener("click", () => {
  const email = emailInput.value;
  sendSignInLinkToEmail(auth, email, actionCodeSettings)
    .then(() => {
      alert("Check your inbox for a login link!");
      window.localStorage.setItem("emailForSignIn", email);
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// Complete sign-in if link is clicked
if (isSignInWithEmailLink(auth, window.location.href)) {
  let email = window.localStorage.getItem("emailForSignIn");
  if (!email) {
    email = window.prompt("Please enter your email to confirm:");
  }

  signInWithEmailLink(auth, email, window.location.href)
    .then(() => {
      alert("Logged in successfully with email link!");
      localStorage.removeItem("emailForSignIn");
      window.location.href = "main.html";
    })
    .catch((error) => {
      alert("Failed to log in: " + error.message);
    });
}
