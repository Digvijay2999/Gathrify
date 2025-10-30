import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Fetch Firebase Config and Initialize
let app;

async function initializeFirebase() {
  try {
    const response = await fetch('/api/firebase-config');
    const firebaseConfig = await response.json();
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

// Initialize Firebase
await initializeFirebase();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔐 Signup (with Email Verification)
document.getElementById("signup-btn").addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      sendEmailVerification(user)
        .then(() => {
          alert("Signup successful! A verification email has been sent.");
        })
        .catch((error) => {
          alert("Error sending verification email: " + error.message);
        });
    })
    .catch((error) => {
      alert("Signup Error: " + error.message);
    });
});

// 🔓 Login (only if email is verified)
document.getElementById("login-btn").addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user.emailVerified) {
        window.location.href = "main.html";
      } else {
        alert("Please verify your email before logging in.");
        signOut(auth);
      }
    })
    .catch((error) => {
      alert("Login Error: " + error.message);
    });
});

// 🔐 Google Login
const googleProvider = new GoogleAuthProvider();
document.getElementById("google-login-btn").addEventListener("click", () => {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      const user = result.user;
      window.location.href = "main.html";
    })
    .catch((error) => {
      alert("Google Login failed: " + error.message);
    });
});

// 🔁 Resend Verification Email
document.getElementById("resend-verification-btn").addEventListener("click", () => {
  const user = auth.currentUser;

  if (user) {
    sendEmailVerification(user)
      .then(() => {
        alert("Verification email resent! Please check your inbox.");
      })
      .catch((error) => {
        alert("Error sending verification email: " + error.message);
      });
  } else {
    alert("You must be logged in to resend the verification email.");
  }
});

