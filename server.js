//Vars
var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fbh = require('./app/helpers/fb-messenger.js');
var port = process.env.PORT || 8080;
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
var methodOverride = require('method-override');
var morgan = require('morgan');
var database = require('./config/database.js');
VALIDATION_TOKEN = require('./app/keys/fb-tokens').VALIDATION_TOKEN; //fb validation token

// App Models

var Chat = require('./app/models/chat.js');

//Configuration -----------------------------------------------------------------------
mongoose.connect(database.remoteUrl); 	// Connect to local MongoDB instance. A remoteUrl is also available (modulus.io)

app.use(express.static('./static')); 		// set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request
// app.use(favicon(__dirname + '.static/public/favicon.ico'));
//-------------------------------------------------------------------------------------

// set the port of our application
// process.env.PORT lets the port be set by Heroku
// set the view e gine to ejs*
// app.set('view engine', 'ejs');
//app.engine('html', require('ejs').renderFile);

// Set Socket.io Connection -----------------------------------------------------------
app.io = io;
//set client server socket connection
io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
});
// End Socket.io Connection -----------------------------------------------------------
// parse application/x-www-form-urlencoded
// app.use(favicon(__dirname + '.static/public/favicon.ico'));

// set the API router and middleware -------------------------------------------------------

router.use(function (req, res, next) {
    // do logging
    console.log('got an API request');
    console.log('request body - ' + JSON.stringify(req.body));
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({message: 'hooray! welcome to our api!'});
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------

router.route('/chat/:chat_id')

// // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
//     .get(function(req, res) {
//         ...
//     })
//
//     // update the bear with this id (accessed at PUT http://localhost:8080/api/chats/:bear_id)
//     .put(function(req, res) {
//         ...
//     })

    // delete the bear with this id (accessed at DELETE http://localhost:8080/api/chat/:bear_id)
    .delete(function(req, res) {
        Chat.remove({
            _id: req.params.chat_id
        }, function(err, chat) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });


router.route('/chat').get(function (req, res) {
    Chat.find(function (err, chats) {
        if (err)
            res.send(err);

        res.json(chats);
    });})
    // create a bear (accessed at POST http://localhost:8080/api/bears)
        .post(function (req, res) {
            var chat = new Chat();
            // create a new instance of the Bear model
            chat.msg = req.body.msg;  // set the bears name (comes from the request)

            // save the bear and check for errors
            chat.save(function (err) {
                if (err)
                    res.send(err);

                res.json({message: 'Chat created!'});
            });

        });
// all of our routes will be prefixed with /api
    app.use('/api', router);

// set the API router and middleware -------------------------------------------------------

    app.get('/webhook', function (req, res) {
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
    app.post('/webhook', function (req, res) {
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
    app.get('/', function (req, res) {
// set the legal route
        // ejs render automatically looks in the views folder
        res.render(__dirname + '/static/index.html');
    });
    app.get('/google564eeaec7a7612c9.html', function (req, res) {
        res.sendFile(path.join(__dirname + 'static/google/google564eeaec7a7612c9.html'));
    });
    app.get('/legal', function (req, res) {
        res.sendFile(path.join(__dirname + '/static/public/legal/privacypolicy.htm'));
    });

    app.listen(port, function () {
        console.log('Our app is running on http://localhost:' + port);
    });
