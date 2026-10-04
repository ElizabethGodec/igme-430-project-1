const http = require('http');
const url = require('url');
const responses = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

//handles incoming requests and routes them to the correct endpoint
const onRequest = (request, response) => {
    const parsedUrl = url.parse(request.url);

    switch (parsedUrl.pathname) {
        case '/getBooks':
            responses.getBooks(request, response);
            break;
        default:
            response.writeHead(404);
            response.end();
            break;
    }
};

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});