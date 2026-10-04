const fs = require('fs');
const path = require('path');

//load and parse the books dataset when the server starts
const booksPath = path.join(__dirname, '..', 'books.json');
const books = JSON.parse(fs.readFileSync(booksPath, 'utf8'));