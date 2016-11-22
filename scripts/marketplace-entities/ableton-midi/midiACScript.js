// Open up a websocket
// var express = require('express');
// var http = require('http');
// var _ = require('underscore');
// var shortid = require('shortid');
// var Max4Node = require('max4node');


// var app = express();
// var server = http.createServer(app);

// var WebSocketServer = require('websocket').server;
// var wsServer = new WebSocketServer({
//     httpServer: server
// });

// https://github.com/alpacaaa/max4node
// push data to abletonLive.js
// var max = new Max4Node();
// max.bind();

Messages.subscribe('Midi-Channel');

Messages.messageReceived.connect(function (channel, message, senderID) {

	print("Message is: " + JSON.stringify(message))
	// get the data from the ableton controller with WebSocket
	// print("channel: " + channel + "message: " + message + "senderID: " + senderID)
	// open up a websocket

});

// function update() {
// 	print("hello")
// }

// function scriptEnding() {
// 	print("Script ended..")
// }

// Script.update.connect(update);

// Script.scriptEnding.connect(scriptEnding);
