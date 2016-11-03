(function() {
	var _this = this;

	var leftDrumStick = undefined;
	var rightDrumStick = undefined; 

	var SCRIPT_URL = 'https://hifi-content.s3.amazonaws.com/lincoln/stickScript.js';

	_this.enterEntity = function(entityID) {

		var stickPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));

		leftDrumStick = Entities.addEntity({
            position: stickPosition,
            dimensions: {
                x: 0.022800000384449959,
                y: 0.72541505098342896,
                z: 0.022800000384449959
            },
            dynamic: true,
            modelURL: "https://hifi-content.s3.amazonaws.com/lincoln/drumstick-single.fbx",
            damping: 0.1,
            name: "Drum Stick - Left",
            registrationPoint: {
                x: 0.5,
                y: 0,
                z: 0.5
            },
            shapeType: "simple-hull",
            type: "Model",
            script: SCRIPT_URL,
			userData: JSON.stringify({
                grabbableKey: {
                    invertSolidWhileHeld: false
                },
                wearable: {
                    joints: {
                        LeftHand: [
                            {x: 0, y: 0.0, z: 0.02 },
                            Quat.fromVec3Degrees({x: 0, y: 0, z: 0})
                        ]
                    }
                }
            })
        });

        Messages.sendLocalMessage('Hifi-Hand-Grab', JSON.stringify({hand: 'left', entityID: leftDrumStick}));

        rightDrumStick = Entities.addEntity({
            position: stickPosition,
            dimensions: {
                x: 0.022800000384449959,
                y: 0.72541505098342896,
                z: 0.022800000384449959
            },
            dynamic: true,
            modelURL: "https://hifi-content.s3.amazonaws.com/lincoln/drumstick-single.fbx",
            damping: 0.1,
            name: "Drum Stick - Right",
            registrationPoint: {
                x: 0.5,
                y: 0,
                z: 0.5
            },
            shapeType: "simple-hull",
            type: "Model",
            script: SCRIPT_URL,
			userData: JSON.stringify({
                grabbableKey: {
                    invertSolidWhileHeld: true
                },
                wearable: {
                    joints: {
                        RightHand: [
                            {x: 0, y: 0.0, z: 0.02 },
                            Quat.fromVec3Degrees({x: 0, y: 0, z: 0})
                        ]
                    }
                }
            })
        });

        Messages.sendLocalMessage('Hifi-Hand-Grab', JSON.stringify({hand: 'right', entityID: rightDrumStick}));
	};

	_this.leaveEntity = function(entityID) {
		print("Leaving Entity")
		
		if(leftDrumStick !== undefined) {
			Entities.deleteEntity(leftDrumStick);
			leftDrumStick = undefined;
		} 
		if(rightDrumStick !== undefined) {
			Entities.deleteEntity(rightDrumStick);
			rightDrumStick = undefined;
		}
	}

	_this.unload = _this.leaveEntity;

});