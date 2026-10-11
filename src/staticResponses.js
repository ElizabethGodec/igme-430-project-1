const fs = require('fs');
const path = require('path');

// Sends a static file with the appropriate response headers
const serveFile = (request, response, filename, contentType) => {
  const filePath = path.join(__dirname, '..', 'client', filename);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      const message = JSON.stringify({
        message: 'File not found.',
      });

      response.writeHead(404, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(message),
      });

      if (request.method !== 'HEAD') {
        response.write(message);
      }

      response.end();
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length,
    });

    if (request.method !== 'HEAD') {
      response.write(content);
    }

    response.end();
  });
};

module.exports = {
  serveFile,
};