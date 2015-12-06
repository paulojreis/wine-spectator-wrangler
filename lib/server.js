var http            = require('http'),
    url             = require('url'),
    fs              = require('fs'),
    DEFAULT_PORT    = 8080,
    staticRoutes    = {},
    server          = http.createServer(handleHTTPRequest),
    serverModule    = {
        startServer     : startServer,
        registerFile    : registerFile
    };

function startServer (port) {
    port = port ? port : DEFAULT_PORT;
    server.listen(port);
}

function registerFile (route, fsPath) {
    if (route && fsPath) {
        staticRoutes['/' + route] = fsPath;
    }
}

function handleHTTPRequest (req, res) {
    var path = url.parse(req.url).pathname,
        file = staticRoutes[path];

    if (file) {
       serveFile(file, res);        
    } else {
        res.writeHead(404, 'Not found');
        res.end();
    }
}

function serveFile (file, res) {
    fs.stat(file, function (err, stat) {
        if (err) {
            res.writeHead(500, 'Internal server error');
            res.end();
            return;
        }

        res.writeHead(200, {
            'Content-Type'   : 'application/json; charset=utf-8',
            'Content-Length' : stat.size
        });

        fs.createReadStream(file).pipe(res);
    });
}

module.exports = serverModule;
