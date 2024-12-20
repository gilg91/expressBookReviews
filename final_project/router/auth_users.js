const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // User storage

const isValid = (username) => {
    if (!username || !/^[a-zA-Z0-9]+$/.test(username)) {
        return false;
    }

    if (username.length < 3 || username.length > 20) {
        return false;
    }

    const reservedUsernames = ['admin', 'root', 'superuser'];
    if (reservedUsernames.includes(username.toLowerCase())) {
        return false;
    }

    return true;
};

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password;
};

// Login Route
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    console.log("Login attempt:", username, password); // Debugging log
    console.log("Users array:", users); // Debugging log

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        const accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });

        // Store token and username in session
        req.session.authorization = {
            accessToken,
            username
        };

        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.query;

    const sessionData = req.session.authorization;
    const token = sessionData && sessionData.accessToken;

    if (!token) {
        return res.status(403).json({ message: "Token is required" });
    }

    jwt.verify(token, 'access', (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        const username = sessionData.username;

        if (!review) {
            return res.status(400).json({ message: "Review is required" });
        }

        const book = books[isbn];
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (!book.reviews) {
            book.reviews = {};
        }

        book.reviews[username] = review;

        return res.status(200).json({
            message: `Review for book with ISBN ${isbn} added/updated successfully`,
            reviews: book.reviews
        });
    });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Extract token from session
    const sessionData = req.session.authorization;
    const token = sessionData && sessionData.accessToken;

    if (!token) {
        return res.status(403).json({ message: "Token is required" });
    }

    // Verify the JWT token
    jwt.verify(token, 'access', (err, user) => {
        if (err) {
            console.log("JWT verification error:", err);
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        const username = user.username; // Extract username from token
        const book = books[isbn];

        if (!book) {
            return res.status(404).json({ message: "Unable to find book!" });
        }

        if (!book.reviews || !book.reviews[username]) {
            return res.status(404).json({ message: "Review not found for this user" });
        }

        // Delete the user's review
        delete book.reviews[username];

        return res.status(200).json({
            message: `Review for book with ISBN ${isbn} deleted successfully.`,
            reviews: book.reviews // Return updated reviews
        });
    });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
