(function() {
	var _this;

	WebEntity = function() {
		_this = this;
	}

	WebEntity.prototype = {
		preload: function(entityID) {
			this.entityID = entityID;
		},
		clickReleaseOnEntity: function() {
			print("clicked..")
		},
		createWebEntity: function() {
			var webEntityProperties = {};
			var webEntity = Entities.addEntity(webEntityProperties)
		}
	}

	return new WebEntity();
});