/*
 * AgriSense - legacy/offline launcher
 * -------------------------------------------------------------------------
 * Serves the PRE-BUILT app in ./public on http://localhost:3000
 *
 * Deliberately dependency-free: only Node's built-in modules are used, so
 * there is NO `npm install` step and no package that can be incompatible with
 * an older Node. Written in plain CommonJS and ES5-safe syntax so it runs on
 * old Node versions (tested logic-wise; targets Node 12/14 on Windows 7).
 *
 * Usage:  node server.js        (or double-click start.bat on Windows)
 */

var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

var PORT = Number(process.env.PORT) || 3000;
var ROOT = path.join(__dirname, 'public');

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function sendFile(res, filePath, statusCode) {
  var ext = path.extname(filePath).toLowerCase();
  var type = MIME[ext] || 'application/octet-stream';
  var headers = { 'Content-Type': type };
  // index.html must never be cached, or updates won't show up.
  if (ext === '.html') {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  } else {
    headers['Cache-Control'] = 'public, max-age=86400';
  }
  res.writeHead(statusCode || 200, headers);
  fs.createReadStream(filePath)
    .on('error', function () {
      res.end();
    })
    .pipe(res);
}

function sendIndex(res, statusCode) {
  var index = path.join(ROOT, 'index.html');
  fs.existsSync(index) ? sendFile(res, index, statusCode) : send404(res);
}

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(
    '<h1>404 - not found</h1>' +
    '<p>The app files are missing. Make sure the <code>public</code> folder sits next to <code>server.js</code>.</p>'
  );
}

var server = http.createServer(function (req, res) {
  var pathname;
  try {
    pathname = decodeURIComponent(url.parse(req.url).pathname || '/');
  } catch (e) {
    return send404(res);
  }

  if (pathname === '/' || pathname === '') return sendIndex(res, 200);

  // Resolve inside ROOT only (blocks ../ traversal).
  var filePath = path.join(ROOT, path.normalize(pathname).replace(/^(\.\.[\/\\])+/, ''));
  if (filePath.indexOf(ROOT) !== 0) return send404(res);

  fs.stat(filePath, function (err, stat) {
    if (!err && stat.isFile()) {
      return sendFile(res, filePath, 200);
    }
    // No file, and the path looks like a route (no extension) -> serve the SPA
    // so deep links like /sensors and /map work.
    if (!path.extname(pathname)) {
      return sendIndex(res, 200);
    }
    send404(res);
  });
});

server.on('error', function (err) {
  if (err.code === 'EADDRINUSE') {
    console.error('');
    console.error('  Port ' + PORT + ' is already in use.');
    console.error('  Close the other program, or run:  set PORT=3001 && node server.js');
    console.error('');
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, function () {
  console.log('');
  console.log('  AgriSense (offline build) is running');
  console.log('  Open:  http://localhost:' + PORT);
  console.log('');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});
