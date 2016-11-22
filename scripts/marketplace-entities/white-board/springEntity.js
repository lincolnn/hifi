(function() {
	var _this;

	Script.include('http://mpassets.highfidelity.com/eade2963-c737-497d-929f-b327cc5d7a48-v1/utils.js');

	function Collider() {
		_this = this;
	}

	Collider.prototype = {
		preload: function() {

		},

		clickReleaseOnEntity: function(entityItemID, mouseEvent) {
			print("This entity is: " + JSON.stringify(entityItemID))
		},

		collisionWithEntity: function(thisEntity, otherEntity, collision) {
            if (collision.type !== 0) {
                //we only want to vibrate on collision start
                return
            }

            print("collided.." + JSON.stringify(otherEntity))		

            // send the message back

		}
	}

	function vibrateControllers() {
		// ..

	}

	return new Collider();
})