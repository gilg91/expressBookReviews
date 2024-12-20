const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username" });
    }

    if (users.some(user => user.username === username)) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password }); // Store plain-text password for now
    console.log("Registered users:", users); // Debugging log

    return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        // Simulate an asynchronous operation using a Promise
        const fetchBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);
                } else {
                    reject(new Error("No books available"));
                }
            });
        };

        // Await the result of the Promise
        const data = await fetchBooks();

        return res.status(200).send(JSON.stringify(data, null, 4)); // Neatly formatted response
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});



// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const fetchBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject(new Error("Book not found"));
                }
            });
        };

        // Await the result of the Promise
        const book = await fetchBookByISBN(isbn);

        return res.status(200).send(JSON.stringify(book, null, 4)); // Neatly formatted response
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Get book details based on Author using async-await
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;

        // Simulate an asynchronous operation to fetch books by author
        const fetchBooksByAuthor = (author) => {
            return new Promise((resolve, reject) => {
                const booksByAuthor = Object.values(books).filter(
                    (book) => book.author === author
                );
                if (booksByAuthor.length > 0) {
                    resolve(booksByAuthor);
                } else {
                    reject(new Error("Books by this author not found"));
                }
            });
        };
        const booksByAuthor = await fetchBooksByAuthor(author);

        return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});



// Get book details based on Title using async-await
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title.toLowerCase();

        const fetchBooksByTitle = (title) => {
            return new Promise((resolve, reject) => {
                const booksByTitle = Object.values(books).filter(
                    (book) => book.title.toLowerCase() === title
                );
                if (booksByTitle.length > 0) {
                    resolve(booksByTitle);
                } else {
                    reject(new Error("Books with this title not found"));
                }
            });
        };
        const booksByTitle = await fetchBooksByTitle(title);

        return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});





// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    // Extract ISBN from request parameters
    const isbn = req.params.isbn;

    // Check if the book exists
    const book = books[isbn];

    if (book) {
        // Return the reviews for the book
        return res.status(200).json({ reviews: book.reviews });
    } else {
        // Return 404 if the book is not found
        return res.status(404).json({ message: "Book not found or no reviews available" });
    }
});


module.exports.general = public_users;
