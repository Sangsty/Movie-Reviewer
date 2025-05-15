import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js";

// Replace with your Firebase configuration (same as in auth.js)
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
const db = getFirestore(app);
const auth = getAuth(app);

// DOM elements
const reviewForm = document.getElementById('reviewFormSection');
const movieTitleInput = document.getElementById('movieTitle');
const reviewTextInput = document.getElementById('reviewText');
const starRatingSelect = document.getElementById('starRating');
const submitReviewBtn = document.getElementById('submitReview');
const reviewsListDiv = document.getElementById('reviewsList');
const reviewError = document.getElementById('reviewError');
const searchTitleInput = document.getElementById('searchTitle');
const filterGenreSelect = document.getElementById('filterGenre');
const filterRatingSelect = document.getElementById('filterRating');

let currentUserId = null;
let allReviews = [];
let genres = new Set(); // To store unique genres for filtering

onAuthStateChanged(auth, (user) => {
    currentUserId = user ? user.uid : null;
    if (user) {
        fetchAndDisplayReviews();
    } else {
        reviewsListDiv.innerHTML = ''; // Clear reviews when logged out
    }
});

async function addReviewToFirestore(reviewData) {
    try {
        const docRef = await addDoc(collection(db, "reviews"), {
            userId: currentUserId,
            title: reviewData.title,
            text: reviewData.text,
            rating: parseInt(reviewData.rating),
            createdAt: new Date()
        });
        console.log("Review added with ID: ", docRef.id);
        reviewForm.style.display = 'none'; // Hide form after submission
        movieTitleInput.value = '';
        reviewTextInput.value = '';
        starRatingSelect.value = '3'; // Reset rating
        reviewError.textContent = '';
    } catch (error) {
        console.error("Error adding review: ", error);
        reviewError.textContent = "Failed to submit review. Please try again.";
    }
}

submitReviewBtn.addEventListener('click', () => {
    if (!currentUserId) {
        reviewError.textContent = "You must be logged in to submit a review.";
        return;
    }

    const title = movieTitleInput.value.trim();
    const text = reviewTextInput.value.trim();
    const rating = starRatingSelect.value;

    if (!title || !text) {
        reviewError.textContent = "Please enter a movie title and review text.";
        return;
    }

    addReviewToFirestore({ title, text, rating });
});

async function fetchAndDisplayReviews(filters = {}) {
    reviewsListDiv.innerHTML = 'Loading reviews...';
    let reviewsQuery = collection(db, "reviews");

    if (filters.title) {
        reviewsQuery = query(reviewsQuery, where('title', '>=', filters.title), where('title', '<=', filters.title + '\uf8ff'));
    }
    if (filters.genre) {
        reviewsQuery = query(reviewsQuery, where('genre', '==', filters.genre)); // Assuming you add genre in the future
    }
    if (filters.rating) {
        reviewsQuery = query(reviewsQuery, where('rating', '==', parseInt(filters.rating)));
    }

    reviewsQuery = query(reviewsQuery, orderBy('createdAt', 'desc'));

    try {
        const querySnapshot = await getDocs(reviewsQuery);
        allReviews = [];
        genres.clear();
        reviewsListDiv.innerHTML = '';
        if (querySnapshot.empty) {
            reviewsListDiv.textContent = 'No reviews yet.';
            return;
        }
        querySnapshot.forEach((doc) => {
            const reviewData = { id: doc.id, ...doc.data() };
            allReviews.push(reviewData);
            // Assuming you might add a genre field later
            // if (reviewData.genre) {
            //     genres.add(reviewData.genre);
            // }
            displayReview(reviewData);
        });
        populateGenreFilter();
    } catch (error) {
        console.error("Error fetching reviews: ", error);
        reviewsListDiv.textContent = "Failed to load reviews.";
    }
}

function displayReview(review) {
    const reviewCard = document.createElement('div');
    reviewCard.classList.add('review-card');
    reviewCard.innerHTML = `
        <h3>${review.title}</h3>
        <p class="rating">${'★'.repeat(review.rating)}</p>
        <p>${review.text}</p>
        <div class="actions">
            ${currentUserId === review.userId ? `
                <button class="edit-btn" data-id="${review.id}">Edit</button>
                <button class="delete-btn" data-id="${review.id}">Delete</button>
            ` : ''}
            </div>
    `;
    reviewsListDiv.appendChild(reviewCard);

    const deleteButton = reviewCard.querySelector('.delete-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            deleteReview(deleteButton.dataset.id);
        });
    }

    const editButton = reviewCard.querySelector('.edit-btn');
    if (editButton) {
        editButton.addEventListener('click', () => {
            // Implement edit functionality
            console.log('Edit review with ID:', editButton.dataset.id);
            // For simplicity, let's just log for now. You'd typically:
            // 1. Populate the review form with the existing data.
            // 2. Change the "Submit Review" button to an "Update Review" button.
            // 3. Handle the update logic in a new function.
        });
    }
}

async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) {
        return;
    }
    try {
        await deleteDoc(doc(db, "reviews", reviewId));
        console.log("Review deleted with ID: ", reviewId);
        fetchAndDisplayReviews();
    } catch (error) {
        console.error("Error deleting review: ", error);
        alert("Failed to delete review.");
    }
}

searchTitleInput.addEventListener('input', () => {
    const searchTerm = searchTitleInput.value.trim();
    fetchAndDisplayReviews({ title: searchTerm });
});

filterGenreSelect.addEventListener('change', () => {
    const selectedGenre = filterGenreSelect.value;
    fetchAndDisplayReviews({ genre: selectedGenre });
});

filterRatingSelect.addEventListener('change', () => {
    const selectedRating = filterRatingSelect.value;
    fetchAndDisplayReviews({ rating: selectedRating });
});

function populateGenreFilter() {
    // In a real app, you'd likely have a way to categorize movies by genre
    // and store that in your database. For this simple example, we'll leave
    // the genre filter mostly empty. You can manually add some options here
    // if you want to simulate genre filtering.
    filterGenreSelect.innerHTML = '<option value="">All Genres</option>';
    // genres.forEach(genre => {
    //     const option = document.createElement('option');
    //     option.value = genre;
    //     option.textContent = genre;
    //     filterGenreSelect.appendChild(option);
    // });
}