(function() {
	var _this;
	var MIDI_CHANNEL = 'Midi-Channel';

	Messages.subscribe(MIDI_CHANNEL);
	// Messages.sendMessage(GAME_CHANNEL, JSON.stringify({action: 'scriptLoaded'}));

	midiEntity = function() {
		_this = this;
	}

	midiEntity.prototype = {
		clickReleaseOnEntity: function(entityItemID, mouseEvent) {
			print("clicked.." + JSON.stringify(entityItemID))
			// send the sound event
			Messages.sendMessage(MIDI_CHANNEL, "hello");
		}
	}

	return new midiEntity();
})