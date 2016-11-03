(function() {
	var _this;

	Script.include('http://mpassets.highfidelity.com/eade2963-c737-497d-929f-b327cc5d7a48-v1/utils.js');

	Palette = function() {
		_this = this;
	}

	Palette.prototype = {
        preload: function(entityID) {
            this.entityID = entityID;
        },		
		clickReleaseOnEntity: function(entityItemID, mouseEvent) {
			_this.markerColor = getEntityUserData(entityItemID).markerColor;
			Messages.sendMessage('Ink-Color', JSON.stringify(_this.markerColor));			
		},
		startNearTrigger: function(entityItemID) {
			_this.markerColor = getEntityUserData(entityItemID).markerColor;
			
			print("Marker color: " + JSON.stringify(_this.markerColor))
			
			Messages.sendMessage('Ink-Color', JSON.stringify(_this.markerColor))		
		}
	}

	return new Palette();
})