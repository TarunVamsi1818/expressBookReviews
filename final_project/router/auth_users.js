// Import required modules
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js"); // Import the books database
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // Write code to check if the username is valid
    return /^[a-zA-Z0-9]+$/.test(username);
};

const authenticatedUser = (username, password) => {
    // Write code to check if username and password match the one we have in records
    return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username format" });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // User authenticated, generate token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    if (!isbn || !review) {
        return res.status(400).json({ message: "ISBN and review are required" });
    }
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add review to the book
    if (!books[isbn].reviews) {
        books[isbn].reviews = [];
    }
    books[isbn].reviews.push(review);
    return res.status(200).json({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Extract ISBN from request parameters
  const { isbn } = req.params;

  // Extract username from request body
  const { username } = req.body;

  // Check if ISBN and username are provided
  if (!isbn || !username) {
      return res.status(400).json({ message: "ISBN and username are required" });
  }

  // Check if the book exists
  if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user is authenticated
  if (!authenticatedUser(username, req.body.password)) {
      return res.status(401).json({ message: "Unauthorized access" });
  }

  // Check if the user has previously submitted a review
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  // Send success response
  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
