const http = require('http');
const url = require('url');
const responses = require('./responses.js');
const staticResponses = require('./staticResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

//handles incoming requests and routes them to the correct endpoint
const onRequest = (request, response) => {
    const parsedUrl = url.parse(request.url, true);

    switch (parsedUrl.pathname) {
        case '/':
        case '/index.html':
            staticResponses.serveFile(request, response, 'index.html', 'text/html');
            break;
        case '/docs.html':
            staticResponses.serveFile(request, response, 'docs.html', 'text/html');
            break;
        case '/style.css':
            staticResponses.serveFile(request, response, 'style.css', 'text/css');
            break;
        case '/client.js':
            staticResponses.serveFile(
                request,
                response,
                'client.js',
                'text/javascript',
            );
            break;
        case '/getBooks':
            if (request.method === 'GET' || request.method === 'HEAD') {
                responses.getBooks(request, response, parsedUrl.query);
            } else {
                responses.methodNotAllowed(request, response, 'GET, HEAD');
            }
            break;
        case '/getBook':
            if (request.method === 'GET' || request.method === 'HEAD') {
                responses.getBook(request, response, parsedUrl.query);
            } else {
                responses.methodNotAllowed(request, response, 'GET, HEAD');
            }
            break;

        case '/getBooksByAuthor':
            if (request.method === 'GET' || request.method === 'HEAD') {
                responses.getBooksByAuthor(request, response, parsedUrl.query);
            } else {
                responses.methodNotAllowed(request, response, 'GET, HEAD');
            }
            break;

        case '/getBooksByGenre':
            if (request.method === 'GET' || request.method === 'HEAD') {
                responses.getBooksByGenre(request, response, parsedUrl.query);
            } else {
                responses.methodNotAllowed(request, response, 'GET, HEAD');
            }
            break;

        case '/getRandomBook':
            if (request.method === 'GET' || request.method === 'HEAD') {
                responses.getRandomBook(request, response, parsedUrl.query);
            } else {
                responses.methodNotAllowed(request, response, 'GET, HEAD');
            }
            break;
        case '/addBook':
            if (request.method === 'POST') {
                responses.addBook(request, response);
            } else {
                responses.methodNotAllowed(request, response, 'POST');
            }
            break;

        case '/updateBook':
            if (request.method === 'POST') {
                responses.updateBook(request, response);
            } else {
                responses.methodNotAllowed(request, response, 'POST');
            }
            break;
        default:
            responses.notFound(request, response);
            break;
    }
};

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});