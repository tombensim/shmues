//Vars
var express = require('express');
var path = require('path');
var server = express();
var http = require('http').Server(server);
var io = require('socket.io')(http);
var fbh = require('./app/helpers/fb-messenger.js');
var port = process.env.PORT || 8080;
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = require('./api/api.js');
var methodOverride = require('method-override');
var morgan = require('morgan');
var database = require('./config/database.js');

VALIDATION_TOKEN = require('./app/keys/fb-tokens').VALIDATION_TOKEN; //fb validation token

// App Models

var Chat = require('./app/models/chat.js');

//Configuration -----------------------------------------------------------------------
mongoose.connect(database.remoteUrl); 	// Connect to local MongoDB instance. A remoteUrl is also available (modulus.io)

server.use(express.static('./static')); 		// set the static files location /public/img will be /img for users
server.use(morgan('dev')); // log every request to the console
server.use(bodyParser.urlencoded({'extended': 'true'})); // parse serverlication/x-www-form-urlencoded
server.use(bodyParser.json()); // parse serverlication/json
server.use(bodyParser.json({type: 'serverlication/vnd.api+json'})); // parse serverlication/vnd.api+json as json
server.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
// server.use(favicon(__dirname + '.static/public/favicon.ico'));
//-------------------------------------------------------------------------------------

// set the port of our serverlication
// process.env.PORT lets the port be set by Heroku
// set the view e gine to ejs*
// server.set('view engine', 'ejs');
//server.engine('html', require('ejs').renderFile);

// Set Socket.io Connection -----------------------------------------------------------
server.io = io;
//set client server socket connection
// io.on('connection', function (socket) {
//     var addedUser = false;
//
//     // when the client emits 'new message', this listens and executes
//     socket.on('new message', function (data) {
//          // we tell the client to execute 'new message'
//         socket.broadcast.emit('new message', {
//             username: socket.username,
//             message: data
//         });
//     });
//
//     // when the client emits 'add user', this listens and executes
//     socket.on('add user', function (username) {
//         if (addedUser) return;
//
//         // we store the username in the socket session for this client
//         socket.username = username;
//         ++numUsers;
//         addedUser = true;
//         socket.emit('login', {
//             numUsers: numUsers
//         });
//         // echo globally (all clients) that a person has connected
//         socket.broadcast.emit('user joined', {
//             username: socket.username,
//             numUsers: numUsers
//         });
//     });
//
//     // when the client emits 'typing', we broadcast it to others
//     socket.on('typing', function () {
//         socket.broadcast.emit('typing', {
//             username: socket.username
//         });
//     });
//
//     // when the client emits 'stop typing', we broadcast it to others
//     socket.on('stop typing', function () {
//         socket.broadcast.emit('stop typing', {
//             username: socket.username
//         });
//     });
//
//     // when the user disconnects.. perform this
//     socket.on('disconnect', function () {
//         if (addedUser) {
//             --numUsers;
//
//             // echo globally that this client has left
//             socket.broadcast.emit('user left', {
//                 username: socket.username,
//                 numUsers: numUsers
//             });
//         }
//     });
// });
//
// // End Socket.io Connection -----------------------------------------------------------

// set the API router and middleware -------------------------------------------------------
// all of our routes will be prefixed with /api
router.use(function (req, res, next) {
    // do logging
    console.log('got an API request');
    console.log('request body - ' + JSON.stringify(req.body));
    next(); // make sure we go to the next routes and don't stop here
});
server.use('/api', router);

// set the API router and middleware -------------------------------------------------------


//Facebook authentication against pageg
server.get('/', function (req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});

// receive messages from facebook messenger to the page account
server.post('/webhook', function (req, res) {
    var data = req.body;
    console.log(data);
    // Make sure this is a page subscription
    if (data.object === 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function (pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function (messagingEvent) {
                if (messagingEvent.optin) {
                    fbh.receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    fbh.receivedMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    fbh.receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    fbh.receivedPostback(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know you've
        // successfully received the callback. Otherwise, the request will time out.
        console.log('received message with message' + data.message);
        res.sendStatus(200);
    }
});

// set the home page route
server.get('/', function (req, res) {
// set the legal route
    // ejs render automatically looks in the views folder
    res.render(__dirname + '/static/index.html');
});
server.get('/google564eeaec7a7612c9.html', function (req, res) {
    res.sendFile(path.join(__dirname + 'static/google/google564eeaec7a7612c9.html'));
});
server.get('/legal', function (req, res) {
    res.sendFile(path.join(__dirname + '/static/public/legal/privacypolicy.htm'));
});

server.listen(port, function () {
    console.log('Our server is running on http://localhost:' + port);
});
