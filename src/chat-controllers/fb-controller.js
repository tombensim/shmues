// tools.js
// ========
module.exports = {
  receivedMessage: function (event) {
 	 var senderID = event.sender.id;
	  var recipientID = event.recipient.id;
	  var timeOfMessage = event.timestamp;
	  var message = event.message;

	  console.log("Received message for user %d and page %d at %d with message:", 
	    senderID, recipientID, timeOfMessage);
	  console.log(JSON.stringify(message));

	  var messageId = message.mid;

	  // You may get a text or attachment but not both
	  var messageText = message.text;
	  var messageAttachments = message.attachments;

	  if (messageText) {

	    // If we receive a text message, check to see if it matches any special
	    // keywords and send back the corresponding example. Otherwise, just echo
	    // the text we received.
	    switch (messageText) {
	      case 'image':
	        sendImageMessage(senderID);
	        break;

	      case 'button':
	        sendButtonMessage(senderID);
	        break;

	      case 'generic':
	        sendGenericMessage(senderID);
	        break;

	      case 'receipt':
	        sendReceiptMessage(senderID);
	        break;

	      default:
	        sendTextMessage(senderID, messageText);
	    }
	  } else if (messageAttachments) {
	    sendTextMessage(senderID, "Message with attachment received");
	  }
	} 
  // whatever
	 , sendTextMessage : function (recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}
};

