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





module.exports = {
    getBooks,
};