var express = require('express');
var app = express();
var VALIDATION_TOKEN = 'EAAQ9NjHaMc0BAOiEBBsIVZCAarY4XYQTsNbA9JNZB7UZCHJQKA6310HWZCYuGfpTVq1tcRmmNP1NURLmiCeZCLTNIobSaa1Y7Tuq2iORha36ZC7ZAjxFAJFF25dejLg18WZCWK3AS44TubgjmmWC4xb5U7Uu3ZAmOTWUlACDt7pP68AZDZD';
// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route

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
app.get('/', function(req, res) {

	// ejs render automatically looks in the views folder
	res.render('index');
});

app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});