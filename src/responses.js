const fs = require('fs');
const path = require('path');
const querystring = require('querystring');



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
const respondJSONMeta = (request, response, status, object) => {
    const content = JSON.stringify(object);

    const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content),
    };

    response.writeHead(status, headers);
    response.end();
};

//seends a successful response with no body content
const respondNoContent = (request, response) => {
    const headers = {
        'Content-Type': 'application/json',
        'Content-Length': 0,
    };

    response.writeHead(204, headers);
    response.end();
};

//collects the body data from a POST request
const parseBody = (request, callback) => {
    const body = [];

    request.on('data', (chunk) => {
        body.push(chunk);
    });

    request.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        const contentType = request.headers['content-type'];

        try {
            if (contentType && contentType.includes('application/json')) {
                callback(null, JSON.parse(bodyString));
            } else if (
                contentType
                && contentType.includes('application/x-www-form-urlencoded')
            ) {
                callback(null, querystring.parse(bodyString));
            } else {
                callback(new Error('Unsupported Content-Type'));
            }
        } catch (error) {
            callback(error);
        }
    });
};

//returns all books in the dataset. added an optional result limit
const getBooks = (request, response, params) => {
    const responseJSON = {};
    let results = books;

    if (params.limit) {
        const limit = parseInt(params.limit, 10);

        if (Number.isNaN(limit) || limit <= 0) {
            responseJSON.message = 'Limit must be a positive number.';
            respondJSON(request, response, 400, responseJSON);
            return;
        }

        results = books.slice(0, limit);
    }

    responseJSON.books = results;

    if (request.method === 'HEAD') {
        respondJSONMeta(request, response, 200, responseJSON);
        return;
    }

    respondJSON(request, response, 200, responseJSON);
};

// returns specific book based on its title
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
        respondJSONMeta(request, response, 200, responseJSON);
        return;
    }

    respondJSON(request, response, 200, responseJSON);
};

// returns all books written by a specific author
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
        respondJSONMeta(request, response, 200, responseJSON);
        return;
    }

    respondJSON(request, response, 200, responseJSON);
};

// returns all books that match a specific genre
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
        respondJSONMeta(request, response, 200, responseJSON);
        return;
    }

    respondJSON(request, response, 200, responseJSON);
};

//adds a new book to the dataset
const addBook = (request, response) => {
    parseBody(request, (error, body) => {
        const responseJSON = {};

        if (error) {
            responseJSON.message = 'Unable to parse request body.';
            respondJSON(request, response, 400, responseJSON);
            return;
        }

        if (!body.title || !body.author) {
            responseJSON.message = 'Title and author are required.';
            respondJSON(request, response, 400, responseJSON);
            return;
        }

        const newBook = {
            author: body.author,
            country: body.country || '',
            language: body.language || '',
            link: body.link || '',
            pages: Number(body.pages) || 0,
            title: body.title,
            year: Number(body.year) || 0,
            genres: body.genres || [],
        };

        books.push(newBook);

        responseJSON.message = 'Book added successfully.';
        responseJSON.book = newBook;

        respondJSON(request, response, 201, responseJSON);
    });
};

//updates an existing book in the dataset
const updateBook = (request, response) => {
    parseBody(request, (error, body) => {
        const responseJSON = {};

        if (error) {
            responseJSON.message = 'Unable to parse request body.';
            respondJSON(request, response, 400, responseJSON);
            return;
        }

        if (!body.title) {
            responseJSON.message = 'A title is required.';
            respondJSON(request, response, 400, responseJSON);
            return;
        }

        const book = books.find(
            (item) => item.title.toLowerCase() === body.title.toLowerCase(),
        );

        if (!book) {
            responseJSON.message = 'Book not found.';
            respondJSON(request, response, 404, responseJSON);
            return;
        }

        const hasUpdates = body.author
            || body.country
            || body.language
            || body.link
            || body.pages
            || body.year
            || body.genres;

        if (!hasUpdates) {
            respondNoContent(request, response);
            return;
        }

        if (body.author) book.author = body.author;
        if (body.country) book.country = body.country;
        if (body.language) book.language = body.language;
        if (body.link) book.link = body.link;
        if (body.pages) book.pages = Number(body.pages);
        if (body.year) book.year = Number(body.year);
        if (body.genres) book.genres = body.genres;

        responseJSON.message = 'Book updated successfully.';
        responseJSON.book = book;

        respondJSON(request, response, 200, responseJSON);
    });
};

//returns a 404 response for an invalid endpoint
const notFound = (request, response) => {
    const responseJSON = {
        message: 'The page you are looking for was not found.',
    };

    respondJSON(request, response, 404, responseJSON);
};




module.exports = {
    getBooks,
    getBook,
    getBooksByAuthor,
    getBooksByGenre,
    addBook,
    updateBook,
    notFound,
};