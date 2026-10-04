const fs = require('fs');
const path = require('path');

//load and parse the books dataset when the server starts
const booksPath = path.join(__dirname, '..', 'books.json');
const books = JSON.parse(fs.readFileSync(booksPath, 'utf8'));

//sends json response with the appropriate status code and headers
const respondJSON = (request, response, status, object) => {
    const content = JSON.stringify(object);

    const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content),
    };

    response.writeHead(status, headers);
    response.write(content);
    response.end();
};

//sends just the headers for a HEAD request
const respondJSONMeta = (request, response, status) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    response.writeHead(status, headers);
    response.end();
};

//returns all books in the dataset
const getBooks = (request, response) => {
    const responseJSON = {
        books,
    };

    if (request.method === 'HEAD') {
        respondJSONMeta(request, response, 200);
        return;
    }

    respondJSON(request, response, 200, responseJSON);
};

// Returns a specific book based on its title
const getBook = (request, response, params) => {
    const responseJSON = {};

    if (!params.title) {
        responseJSON.message = 'A title parameter is required.';
        respondJSON(request, response, 400, responseJSON);
        return;
    }

    const book = books.find(
        (item) => item.title.toLowerCase() === params.title.toLowerCase(),
    );

    if (!book) {
        responseJSON.message = 'Book not found.';
        respondJSON(request, response, 404, responseJSON);
        return;
    }

    responseJSON.book = book;

    if (request.method === 'HEAD') {
        respondJSONMeta(request, response, 200);
        return;
    }

    respondJSON(request, response, 200, responseJSON);
};

// Returns all books written by a specific author
const getBooksByAuthor = (request, response, params) => {
    const responseJSON = {};

    if (!params.author) {
        responseJSON.message = 'An author parameter is required.';
        respondJSON(request, response, 400, responseJSON);
        return;
    }

    const matchingBooks = books.filter(
        (book) => book.author.toLowerCase() === params.author.toLowerCase(),
    );

    if (matchingBooks.length === 0) {
        responseJSON.message = 'No books found for that author.';
        respondJSON(request, response, 404, responseJSON);
        return;
    }

    responseJSON.books = matchingBooks;

    if (request.method === 'HEAD') {
        respondJSONMeta(request, response, 200);
        return;
    }

    respondJSON(request, response, 200, responseJSON);
};

// Returns all books that match a specific genre
const getBooksByGenre = (request, response, params) => {
    const responseJSON = {};

    if (!params.genre) {
        responseJSON.message = 'A genre parameter is required.';
        respondJSON(request, response, 400, responseJSON);
        return;
    }

    const matchingBooks = books.filter((book) =>
        book.genres && book.genres.some(
            (genre) => genre.toLowerCase() === params.genre.toLowerCase(),
        ));

    if (matchingBooks.length === 0) {
        responseJSON.message = 'No books found for that genre.';
        respondJSON(request, response, 404, responseJSON);
        return;
    }

    responseJSON.books = matchingBooks;

    if (request.method === 'HEAD') {
        respondJSONMeta(request, response, 200);
        return;
    }

    respondJSON(request, response, 200, responseJSON);
};



module.exports = {
    getBooks,
    getBook,
    getBooksByAuthor,
    getBooksByGenre,
};