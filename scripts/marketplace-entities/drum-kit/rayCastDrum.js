"use strict";

Script.include("/~/system/libraries/controllers.js");

// var pickRay = {
// 	origin: MyAvatar.position, // change to hand
// 	direction: Quat.getUp(MyAvatar.rotation)
// }

// var intersection = Entities.findRayIntersection(pickRay, true);

// if(intersection.intersects) {
// 	print(intersection.entityID);
// }

(function() {
	
	// check to see if the stick is grabbed

	// if grabbed then poll intersection
	function update() {
		print("updating..")

	};


	function cleanup() {
	    rightController.cleanup();
	    leftController.cleanup();
	    Controller.disableMapping(MAPPING_NAME);
	    Reticle.setVisible(true);
	}

	Script.scriptEnding.connect(cleanup);
	Script.update.connect(update);
})();