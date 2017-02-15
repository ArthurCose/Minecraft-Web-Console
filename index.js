const SessionHandler = require("./app/SessionHandler");
const WebSocketServer = require('websocket').server;
const express = require('express');
const logger = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const port = parseInt(process.env.PORT || '8080');
var server;

init();

function init()
{
  app.use(logger('dev'));
  app.use(express.static(path.join(__dirname, 'public')));
  server = app.listen(port);
  
  setupWebsocketServer();
  setFileAssociations();
  setupErrorHandlers();
}

function setupWebsocketServer()
{
  var sessionHandler = new SessionHandler();
  var wsServer = new WebSocketServer({ httpServer : server });
  
  wsServer.on('request', (request) => request.accept());
  wsServer.on('connect', (connection) => sessionHandler.connectSession(connection));
}

function setFileAssociations()
{
  var fileMap = {
    "/javascript/xterm.js": "/node_modules/xterm/dist/xterm.js",
    "/javascript/xterm.js.map": "/node_modules/xterm/dist/xterm.js.map",
    "/javascript/fit.js": "/node_modules/xterm/dist/addons/fit/fit.js",
    "/stylesheets/xterm.css": "/node_modules/xterm/dist/xterm.css"
  };
  
  for(var publicPath in fileMap)
  {
    let filePath = __dirname + fileMap[publicPath];
    
    app.get(publicPath, (req, res) => {
      fs.createReadStream(filePath).pipe(res);
    });
  }
}

function setupErrorHandlers()
{
  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(function(err, req, res, next) {
    console.log(err.message);
    res.status(err.status || 500)
       .send(err.message);
  });

  // server error
  server.on('error', function(error) {
    if (error.syscall != 'listen') 
      throw error;

    var bind = typeof port == 'string' ? 'Pipe ' + port
                                       : 'Port ' + port;

    switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      break;
    default:
      throw error;
    }

    process.exit(1);
  });
}
