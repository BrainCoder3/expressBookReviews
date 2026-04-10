const express = require('express');
const public_users = express.Router();
const axios = require('axios');
const books = require('../books.js');
let users = require('../users.js');

const BASE_URL = 'http://localhost:5000';

// ═══════════════════════════════════════════════════════════════
// TASKS 1–6 : Routes SYNCHRONES (implémentation originale)
// ═══════════════════════════════════════════════════════════════

// Task 1: Get all books
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book by ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Get books by author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const bookKeys = Object.keys(books);
  const matchingBooks = {};
  bookKeys.forEach(key => {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      matchingBooks[key] = books[key];
    }
  });
  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Task 4: Get books by title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const bookKeys = Object.keys(books);
  const matchingBooks = {};
  bookKeys.forEach(key => {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      matchingBooks[key] = books[key];
    }
  });
  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Task 5: Get book reviews by ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 6: Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists. Please choose a different username." });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// ═══════════════════════════════════════════════════════════════
// TASK 10 : Get ALL books — async/await with Axios (Promise)
// GET /async/books
// ═══════════════════════════════════════════════════════════════
public_users.get('/async/books', async (req, res) => {
  const getAllBooks = () => {
    return new Promise((resolve, reject) => {
      axios.get(`${BASE_URL}/`)
        .then(response => resolve(response.data))
        .catch(err => reject(err));
    });
  };

  try {
    const data = await getAllBooks();
    return res.status(200).send(JSON.stringify(data, null, 4));
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// TASK 11 : Get book by ISBN — async/await with Axios (Promise)
// GET /async/isbn/:isbn
// ═══════════════════════════════════════════════════════════════
public_users.get('/async/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      axios.get(`${BASE_URL}/isbn/${isbn}`)
        .then(response => resolve(response.data))
        .catch(err => {
          if (err.response && err.response.status === 404) {
            reject(new Error("Book not found"));
          } else {
            reject(err);
          }
        });
    });
  };

  try {
    const data = await getBookByISBN(isbn);
    return res.status(200).json(data);
  } catch (err) {
    const status = err.message === "Book not found" ? 404 : 500;
    return res.status(status).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// TASK 12 : Get books by Author — async/await with Axios (Promise)
// GET /async/author/:author
// ═══════════════════════════════════════════════════════════════
public_users.get('/async/author/:author', async (req, res) => {
  const author = req.params.author;

  const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`)
        .then(response => resolve(response.data))
        .catch(err => {
          if (err.response && err.response.status === 404) {
            reject(new Error("No books found for this author"));
          } else {
            reject(err);
          }
        });
    });
  };

  try {
    const data = await getBooksByAuthor(author);
    return res.status(200).json(data);
  } catch (err) {
    const status = err.message.includes("No books") ? 404 : 500;
    return res.status(status).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// TASK 13 : Get books by Title — async/await with Axios (Promise)
// GET /async/title/:title
// ═══════════════════════════════════════════════════════════════
public_users.get('/async/title/:title', async (req, res) => {
  const title = req.params.title;

  const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
        .then(response => resolve(response.data))
        .catch(err => {
          if (err.response && err.response.status === 404) {
            reject(new Error("No books found with this title"));
          } else {
            reject(err);
          }
        });
    });
  };

  try {
    const data = await getBooksByTitle(title);
    return res.status(200).json(data);
  } catch (err) {
    const status = err.message.includes("No books") ? 404 : 500;
    return res.status(status).json({ message: err.message });
  }
});

module.exports.general = public_users;