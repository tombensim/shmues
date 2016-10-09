/**
 * Created by tom.ben-simhon on 10/6/2016.
 * Routes all API requests -
 */

//TODO : move the Chat routes to a different router (./chat/chat-router.js)

var Chat =require('../app/models/chat');
var express = require('express'),
    router = express.Router();

router.use(function (req, res, next) {
    // do logging
    console.log('got an API request');
    console.log('request body - ' + JSON.stringify(req.body));
    next(); // make sure we go to the next routes and don't stop here
});

// REGISTER OUR ROUTES -------------------------------

router.route('/chat/:chat_id')

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
        chat.msg = req.body.text;  // set the bears name (comes from the request)

        // save the bear and check for errors
        chat.save(function (err) {
            if (err)
                res.send(err);
            res.json({message: 'Chat created!'});
        });

    });

module.exports = router;