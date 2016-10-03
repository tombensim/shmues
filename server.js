var express = require('express');
var path = require('path');
var app = express();
var fbh = require('./helpers/fb-messenger.js');
var VALIDATION_TOKEN = 'EAAQ9NjHaMc0BAG4k3aBPkU72vQ3z5Xg4acksKfrmiTzkrlG0cypJlJCwZBq6lRYwAOpZAOpZB7gGPIFkZA5WpWoYF7KjGZAhVuZA9YZCLojalh31mHwVfUZAVBkUmMRWkRjYJBdW2OsHRfjx078SjZAvaOJY7PosTI1d18bU1hfAZCnAZDZD';
var PAGE_ACCESS_TOKEN ='EAAQ9NjHaMc0BAG4k3aBPkU72vQ3z5Xg4acksKfrmiTzkrlG0cypJlJCwZBq6lRYwAOpZAOpZB7gGPIFkZA5WpWoYF7KjGZAhVuZA9YZCLojalh31mHwVfUZAVBkUmMRWkRjYJBdW2OsHRfjx078SjZAvaOJY7PosTI1d18bU1hfAZCnAZDZD';
var port = process.env.PORT || 8080;
var favicon = require('serve-favicon');
// set the port of our application
// process.env.PORT lets the port be set by Heroku
// set the view engine to ejs*
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.use('/static', express.static(__dirname + './legal/'));
//GET Webhook from facebook messenger service, will be used to validate the server against facebook
app.get('/legal',function(req,res) {
	 res.sendFile(path.join(__dirname + '/legal/privacypolicy.htm'));
});
app.get('/webhook', function(req, res) {
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
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
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
    console.log('received message with message' + data.message)
    res.sendStatus(200);
  }
});

// set the home page route
app.get('/', function(req, res) {

	// ejs render automatically looks in the views folder
	res.render('index');
});
app.get('/google564eeaec7a7612c9.html',function(req,res){
	res.sendFile(path.join(__dirname + '/google564eeaec7a7612c9.html'));
});
app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});

