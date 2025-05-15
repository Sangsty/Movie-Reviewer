import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js";

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userGreeting = document.getElementById('userGreeting');
const authSection = document.getElementById('authSection');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const signupEmailInput = document.getElementById('signupEmail');
const signupPasswordInput = document.getElementById('signupPassword');
const loginSubmitBtn = document.getElementById('loginSubmit');
const signupSubmitBtn = document.getElementById('signupSubmit');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const reviewFormSection = document.getElementById('reviewFormSection');

// Event listeners
loginBtn.addEventListener('click', () => {
    authSection.style.display = 'block';
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
});

signupBtn.addEventListener('click', () => {
    authSection.style.display = 'block';
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
});

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log('User signed out');
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

loginSubmitBtn.addEventListener('click', async () => {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;
    loginError.textContent = '';
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        loginError.textContent = getErrorMessage(error.code);
    }
});

signupSubmitBtn.addEventListener('click', async () => {
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;
    signupError.textContent = '';
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        signupError.textContent = getErrorMessage(error.code);
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        userGreeting.style.display = 'inline';
        userGreeting.textContent = `Welcome, ${user.email}!`;
        authSection.style.display = 'none';
        reviewFormSection.style.display = 'block';
        // Potentially fetch and display reviews here or in app.js
    } else {
        // User is signed out
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userGreeting.style.display = 'none';
        authSection.style.display = 'none'; // Hide auth section by default when logged out
        reviewFormSection.style.display = 'none'; // Hide review form when logged out
        // Clear any displayed reviews
    }
});

function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid email.';
        case 'auth/user-disabled':
            return 'This user account has been disabled.';
        case 'auth/user-not-found':
            return 'User not found.';
        case 'auth/wrong-password':
            return 'Wrong password.';
        case 'auth/email-already-in-use':
            return 'Email address is already in use.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}
