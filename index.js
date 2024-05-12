import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFirestore, onSnapshot, query, collection, orderBy, addDoc, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDNcPqyibyYZ0talJLSzNp-GYLbIuz-HNI",
    authDomain: "cs022-2357620.firebaseapp.com",
    projectId: "cs022-2357620",
    storageBucket: "cs022-2357620.appspot.com",
    messagingSenderId: "127913049834",
    appId: "1:127913049834:web:2cb945c983bdd4dd7ea193"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to render movie entries in the table
function renderMovies(snapshot) {
    $('#reviewList').empty();
    snapshot.forEach((doc) => {
        const data = doc.data();
        const row = `
            <tr>
                <td>${data.movie_name}</td>
                <td>${data.movie_rating}</td>
                <td>${data.director_name}</td>
                <td>${data.release_date}</td>
                <td>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${doc.id}">Delete</button>
                    <button class="btn btn-primary btn-sm edit-btn" data-id="${doc.id}" id="editButton">Edit</button>
                </td>
            </tr>`;
        $('#reviewList').append(row);
    });
    $('#mainTitle').html(snapshot.size + " movie reviews in the list");
}

// Function to get sorted data based on selected category
function getSortedData(category) {
    const q = query(collection(db, "Movies"), orderBy(category));
    onSnapshot(q, (snapshot) => {
        renderMovies(snapshot);
    });
}

// Add event listener for sorting buttons
$('.sort-btn').click(function() {
    const category = $(this).data('category');
    getSortedData(category);
});

// Default sorting on movie name
getSortedData('movie_name');

// Add event listener for form submission
$("#addMovieForm").submit(async function(event) {
    event.preventDefault();
    const movieName = $("#movieName").val();
    const movieRating = parseInt($("#movieRating").val());
    const directorName = $("#directorName").val();
    const releaseDate = $("#releaseDate").val();
    if (movieName && !isNaN(movieRating) && movieRating >= 0 && movieRating <= 5 && directorName && releaseDate) {
        try {
            const movieId = $("#movieId").val();
            if (movieId) {
                // If movieId exists, it means we are editing existing data
                await setDoc(doc(db, "Movies", movieId), {
                    movie_name: movieName,
                    movie_rating: movieRating,
                    director_name: directorName,
                    release_date: releaseDate
                });
                // Reset form and movieId after editing
                $("#movieId").val('');
            } else {
                // Otherwise, we are adding new data
                await addDoc(collection(db, "Movies"), {
                    movie_name: movieName,
                    movie_rating: movieRating,
                    director_name: directorName,
                    release_date: releaseDate
                });
            }
            // Reset form
            $("#movieName").val('');
            $("#movieRating").val('0');
            $("#directorName").val('');
            $("#releaseDate").val('');
        } catch (error) {
            console.error("Error adding/editing document: ", error);
        }
    } else {
        alert("Invalid input. Please enter valid movie details.");
    }
});

// Delete button pressed
$(document).on('click', '.delete-btn', async function () {
    const id = $(this).data('id');
    if (confirm("Are you sure you want to delete this movie review?")) {
        try {
            await deleteDoc(doc(db, "Movies", id));
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    }
});

// Edit button pressed
$(document).on('click', '.edit-btn', async function () {
    const id = $(this).data('id');
    try {

        const docRef = doc(db, "Movies", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            $("#movieName").val(data.movie_name);
            $("#movieRating").val(data.movie_rating);
            $("#directorName").val(data.director_name);
            $("#releaseDate").val(data.release_date);
            $("#movieId").val(id); // Set movieId hidden input field for identifying edit mode
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error getting document:", error);
    }
});
