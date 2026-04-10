const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{username:"noe",password:"123"}];

const books = require('../books.js');
let users = require('../users.js');
 
const JWT_SECRET = "fingerprint_customer";
 
// Helper: vérifier si l'utilisateur existe déjà
const isValid = (username) => {
  return users.some(u => u.username === username);
};
 
// Helper: vérifier username + password
const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
};
 
// ─────────────────────────────────────────────
// TÂCHE 7 : Connexion utilisateur enregistré
// POST /customer/login
// ─────────────────────────────────────────────
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
 
  // Validation des champs
  if (!username || !password) {
    return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis." });
  }
 
  // Vérifier les identifiants
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Identifiants invalides. Vérifiez votre nom d'utilisateur et mot de passe." });
  }
 
  // Générer le token JWT et l'enregistrer dans la session
  const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  req.session.authorization = { accessToken, username };
 
  return res.status(200).json({
    message: "Customer successfully logged in",
    token: accessToken
  });
});
 

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.username;
 
  // Vérifier que le livre existe
  if (!books[isbn]) {
    return res.status(404).json({ message: `Aucun livre trouvé pour l'ISBN : ${isbn}` });
  }
 
  // Vérifier que l'avis est fourni
  if (!review) {
    return res.status(400).json({ message: "Le paramètre 'review' est requis." });
  }
 
  // Si l'utilisateur a déjà posté un avis → mise à jour, sinon → ajout
  const action = books[isbn].reviews[username] ? "mis à jour" : "ajouté";
  books[isbn].reviews[username] = review;
 
  return res.status(200).json({
    message: `Avis ${action} avec succès pour l'utilisateur '${username}' sur l'ISBN ${isbn}.`,
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;
 
  // Vérifier que le livre existe
  if (!books[isbn]) {
    return res.status(404).json({ message: `Aucun livre trouvé pour l'ISBN : ${isbn}` });
  }
 
  // Vérifier que l'utilisateur a bien un avis à supprimer
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({
      message: `Aucun avis trouvé pour l'utilisateur '${username}' sur l'ISBN ${isbn}.`
    });
  }
 
  // Supprimer uniquement l'avis de CET utilisateur
  delete books[isbn].reviews[username];
 
  return res.status(200).json({
    message: `Avis de l'utilisateur '${username}' supprimé avec succès pour l'ISBN ${isbn}.`,
    reviews: books[isbn].reviews
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
