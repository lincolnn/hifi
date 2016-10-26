// *********************************************************************************************************************
// version 1.0: Functional release for wider testing, chair scaling, chair geometry raycast detection,
//              and ALT focusing functionality not enabled, manual override of position with userdata not documented.
// *********************************************************************************************************************
// 
//
// Created by Triplelexx on 16/05/26
// Copyright 2016 High Fidelity, Inc.
//
// An entity that can be sat upon
// 
// Sitting animations adapted by Triplelexx from version obtained from Mixamo
// Links provided to copies of original animations created by High Fidelity, Inc
// this is due to issues requiring use of overrideRoleAnimation to chain animations and not knowing a better way
// to reference them cross-platform.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var _this;

    var BASE_PATH = "http://mpassets.highfidelity.com/875bcd3b-7b7d-45a1-a429-c0c6eefad95d-v1/";
	// var COLLIDER_SCRIPT_URL = "http://mpassets.highfidelity.com/875bcd3b-7b7d-45a1-a429-c0c6eefad95d-v1/chairCollider.js?v=1";
    var COLLIDER_SCRIPT_URL = "http://localhost:8080/chair/chairCollider.js";
    var SIT_MAPPING_NAME = "chair.sit.override";
    var IK_TYPES = {
        RotationAndPosition: 0,
        RotationOnly: 1,
        HmdHead: 2,
        HipsRelativeRotationAndPosition: 3,
        Off: 4
    };
    var IDLE_ANIM = {
        url: BASE_PATH + "idle.fbx",
        playbackRate: 30.0,
        loopFlag: true,
        startFrame: 1.0,
        endFrame: 300.0
    };
    var FLY_ANIM = {
        url: BASE_PATH + "fly.fbx",
        playbackRate: 30.0,
        loopFlag: true,
        startFrame: 1.0,
        endFrame: 80.0
    };
    var IDLE_TALK_ANIM = {
        url: BASE_PATH + "talk.fbx",
        playbackRate: 30.0,
        loopFlag: true,
        startFrame: 1.0,
        endFrame: 800.0
    };
    var SIT_DOWN_ANIM = {
        url: BASE_PATH + "sit_down.fbx",
        playbackRate: 30.0,
        loopFlag: false,
        startFrame: 1.0,
        endFrame: 120.0
    };
    var SIT_IDLE_ANIM = {
        url: BASE_PATH + "sit_idle_inplace.fbx",
        playbackRate: 30.0,
        loopFlag: true,
        startFrame: 1.0,
        endFrame: 80.0
    };
    var SIT_IDLE_TALK_ANIM = {
        url: BASE_PATH + "sit_idle_talk_inplace.fbx",
        playbackRate: 30.0,
        loopFlag: true,
        startFrame: 1.0,
        endFrame: 80.0
    };
    var HALF = 0.5;
    var HALF_CIRCLE = 180.0;
    var SMALL_DIST = 0.1;
    var VERY_SMALL_DIST = 0.01;
    var NULL_UUID = "{00000000-0000-0000-0000-000000000000}";
    var SCALE_SPEED_FACTOR = 0.001;
    var AZIMUTH_RATE = 90.0;
    var ALTITUDE_RATE = 200.0;
    var RAD_TO_DEG = 180.0 / Math.PI;
    var Y_AXIS = {
        x: 0,
        y: 1,
        z: 0
    };
    var X_AXIS = {
      x: 1,
      y: 0,
      z: 0
    };
    var CAMERA_ZOOM_MIN = 1.0;
    var CAMERA_ZOOM_MAX = 15.0;
    var CAMERA_ZOOM_INCREMENT = 0.5;
    // var CAMERA_FOCUSOBJECT_MAX_SIZE = 10.0;
    var LONG_DELAY = 2000;
    var SHORT_DELAY = 200;
    var VERY_SHORT_DELAY = 100;

    ChairEntity = function() {
        _this = this;
        return;
    };

    ChairEntity.prototype = {
        chairProperties: null,
        sitAnimationHandlerId: null,
        allowScaling: false,
        isSitting: false,
        isStartingSit: false,
        seatPositionFront: Vec3.ZERO,
        seatPositionCenter: Vec3.ZERO,
        originalDimensions: Vec3.ZERO,
        manualSitTarget: Vec3.ZERO,
        sitEventMapping: null,
        mouseLastX: 0,
        mouseLastY: 0,
        altitude: 0,
        azimuth: 0,
        seatedOrientation: Vec3.ZERO,
        cameraVector: Vec3.ZERO,
        cameraPosition: Vec3.ZERO,
        cameraRadius: 1,
        cameraLastMode: "third person",
        cameraTargetPosition: Vec3.ZERO,
        rightMousePressed: false,
        sitDownAnimation: AnimationCache.prefetch(SIT_DOWN_ANIM.url),
        sitIdleAnimation: AnimationCache.prefetch(SIT_IDLE_ANIM.url),
        sitIdleTalkAnimation: AnimationCache.prefetch(SIT_IDLE_TALK_ANIM.url),
        idleAnimation: AnimationCache.prefetch(IDLE_ANIM.url),
        flyAnimation: AnimationCache.prefetch(FLY_ANIM.url),
        talkAnimation: AnimationCache.prefetch(IDLE_TALK_ANIM.url),
        getUserData: function() {
            this.chairProperties = Entities.getEntityProperties(this.entityId, ["position", "rotation",
                                                                                "dimensions", "userData"]);
            try {
                var userData = JSON.parse(this.chairProperties.userData);
                if(userData.allowScaling == true || userData.allowScaling == false) {
                    this.allowScaling = userData.allowScaling;
                }
                if(userData.manualSitTarget.x != 0.0 || userData.manualSitTarget.y != 0.0 ||
                   userData.manualSitTarget.z != 0.0) {
                    this.manualSitTarget = userData.manualSitTarget;
                }
            } catch(errorState) {
                print("userData error: " + errorState);
            }
        },
        getChairSurface: function() {
            if(this.manualSitTarget.x != 0.0 && this.manualSitTarget.y != 0.0 && this.manualSitTarget.z != 0.0) {
                this.seatPositionCenter = this.manualSitTarget;
                return;
            }
            var seatPosition = this.chairProperties.position;
            seatPosition.y += (HALF - (SMALL_DIST * HALF));
            this.seatPositionCenter = seatPosition;
            var DIST_INFRONT = 1.0;
            var chairFront = Quat.multiply(this.chairProperties.rotation,
                                            Quat.fromPitchYawRollDegrees(0.0, HALF_CIRCLE, 0.0));

            this.seatPositionFront =  Vec3.sum(seatPosition, Vec3.multiply(Quat.getFront(chairFront), DIST_INFRONT));
            /* Disabled raycast position detection
            var DIST_INFRONT = 1.0;
            var DIST_ABOVE = 1.0;
            var chairPosition = this.chairProperties.position;

            // raycast down from above the chair
            chairPosition.y += DIST_ABOVE;
            var intersectionDown = Entities.findRayIntersection({direction: Vec3.UNIT_NEG_Y,
                                                                 origin: chairPosition}, true);

            if(intersectionDown.intersects) {
                if(intersectionDown.entityID === this.entityId) {
                    // we found the highest point in middle
                    this.seatPositionCenter = intersectionDown.intersection;
                    // make the seat position a bit further forward to allow for short legs
                    var frontVec = Quat.getFront(this.chairProperties.rotation);
                    this.seatPositionCenter = Vec3.sum(this.seatPositionCenter, Vec3.multiply(-SMALL_DIST, frontVec));
                    // set y slightly lower so next ray to find the front will hit
                    chairPosition.y = intersectionDown.intersection.y - VERY_SMALL_DIST;
                    // we cast a ray in front of the chair going backward to find the front of the geometry
                    var chairFront = Quat.multiply(this.chairProperties.rotation,
                                                      Quat.fromPitchYawRollDegrees(0.0, HALF_CIRCLE, 0.0));

                    chairPosition =  Vec3.sum(chairPosition, Vec3.multiply(Quat.getFront(chairFront), DIST_INFRONT));
                    var intersectionFront = Entities.findRayIntersection({
                                                direction: Quat.getFront(this.chairProperties.rotation),
                                                origin: chairPosition
                                            }, true);

                    if(intersectionFront.intersects) {
                        if(intersectionFront.entityID === this.entityId) {
                            this.seatPositionFront = Vec3.sum(intersectionFront.intersection, 
                                                            Vec3.multiply(Quat.getFront(chairFront), SMALL_DIST));
                        }
                    } else {
                        this.seatPositionFront = this.chairProperties.position;
                    }
                }
            } else {
                this.seatPositionCenter = this.chairProperties.position;
                this.seatPositionFront = this.chairProperties.position;
            }
            */
        },      
		makeDetectorZone: function() {		
			var StartPosition = Vec3.sum(this.chairProperties.position, Vec3.multiply(-0.25, Quat.getFront(this.chairProperties.rotation)));
            var zonesArray = Entities.findEntities(StartPosition, 0);
            if(zonesArray.length > 0 ) {
                return;    
            }
            
			var triggerVolume = Entities.addEntity({
				type: "Zone",
				name: "Chair detection zone",
				position: StartPosition,
				dimensions: {
				  x: 0.65,
				  y: 1.5,
				  z: 0.65
				},
				// a registration point of 0 is enforced in y 
				registrationPoint: {
				  x: 0.5,
				  y: 0.0,
				  z: 0.5
				},
				dynamic: false,
				parentID: this.entityId,
				visible: false,
				script: COLLIDER_SCRIPT_URL,
				collisionless: true,
				collisionsWillMove: false,
				friction: 1.0,
				grabbable: false,
				damping: 0.2,
				lifetime: -1,
				angularDamping: 1.0,
				shapeType: "box",
				userData: JSON.stringify({
					grabbableKey: {
						grabbable: false
					}
				})
			});			
			
		// END
		},
        scaleChair: function() {
            if(!this.allowScaling) {
                return;
            }

            var currentDimensions = this.chairProperties.dimensions;
            this.originalDimensions = this.chairProperties.dimensions;
            var difference = Vec3.ZERO;
            if(MyAvatar.scale > 1.0) {
                difference.x = (currentDimensions.x * MyAvatar.scale) - currentDimensions.x;
                difference.y = (currentDimensions.y * MyAvatar.scale) - currentDimensions.y;
                difference.z = (currentDimensions.z * MyAvatar.scale) - currentDimensions.z;

                Entities.editEntity(this.entityId, {
                    dimensions: {
                      x: currentDimensions.x + difference.x,
                      y: currentDimensions.y + difference.y,
                      z: currentDimensions.z + difference.z
                    }
                });
            } else {
                difference.x = currentDimensions.x - (currentDimensions.x * MyAvatar.scale);
                difference.y = currentDimensions.y - (currentDimensions.y * MyAvatar.scale);
                difference.z = currentDimensions.z - (currentDimensions.z * MyAvatar.scale);
                Entities.editEntity(this.entityId, {
                    dimensions: {
                      x: currentDimensions.x - difference.x,
                      y: currentDimensions.y - difference.y,
                      z: currentDimensions.z - difference.z
                    }
                });   
            }
        },
        resetChairScale: function() {
            if(!this.allowScaling) {
                return;
            }
            // check again for valid data
            this.getUserData();
            var currentDimensions = this.chairProperties.dimensions;
            var difference = Vec3.ZERO;
            if(currentDimensions.y > this.originalDimensions.y) {
                difference.x = currentDimensions.x - this.originalDimensions.x;
                difference.y = currentDimensions.y - this.originalDimensions.y;
                difference.z = currentDimensions.z - this.originalDimensions.z;
                Entities.editEntity(this.entityId, {
                    dimensions: {
                      x: currentDimensions.x - difference.x,
                      y: currentDimensions.y - difference.y,
                      z: currentDimensions.z - difference.z
                    }
                });
            } else {
                difference.x = this.originalDimensions.x - currentDimensions.x;
                difference.y = this.originalDimensions.y - currentDimensions.y;
                difference.z = this.originalDimensions.z - currentDimensions.z;
                Entities.editEntity(this.entityId, {
                    dimensions: {
                      x: currentDimensions.x + difference.x,
                      y: currentDimensions.y + difference.y,
                      z: currentDimensions.z + difference.z
                    }
                });
            }
        },
        moveAvatarToChairCenter: function() {
            // disable collisions
            MyAvatar.characterControllerEnabled  = false;
            var SEAT_OFFSET = 0.2;
            if(this.allowScaling) {
                this.seatPositionCenter.y += SEAT_OFFSET * MyAvatar.scale;
            } else {
                this.seatPositionCenter.y += SEAT_OFFSET;
            }
            // allow time before sitting
            Script.setTimeout(function() {
                MyAvatar.position = _this.seatPositionCenter;
                MyAvatar.velocity = Vec3.ZERO;
                MyAvatar.angularVelocity = Vec3.ZERO;
            }, VERY_SHORT_DELAY);
        },
        moveAvatarToChairFront: function() {
            // enable collisions
            MyAvatar.position = this.seatPositionFront;
            MyAvatar.characterControllerEnabled  = true;
        },
        maybeSit: function() {
            var MAX_ROT = 0.01;
            // block unacceptable attempts including the chair being tipped
            var chairRotation = Quat.safeEulerAngles(this.chairProperties.rotation);
            if(this.isSitting || this.isStartingSit || chairRotation.x > MAX_ROT || chairRotation.x < -MAX_ROT ||
                chairRotation.z > MAX_ROT || chairRotation.z < -MAX_ROT) {
                return;
            }
            this.isStartingSit = true;
            this.scaleChair();
            // get the post-scaled chair surface
            this.getUserData();
            this.getChairSurface();
            this.setSitControllerMapping();
            this.sitDown();
        },
        sitAnimationHandler: function() {
            return {
                isFlying: false,
                isNotMoving: true,
                ikOverlayAlpha: 1.0,
                isMovingForward: false,
                isMovingBackward: false,
                isMovingLeft: false,
                isMovingRight: false,
                isNotTurning: true,
                isTurningLeft: false,
                isTurningRight: false,
                inAirAlpha: 0.0
            };
        },
        sitAnimationHMDHandler: function() {
            return {
                leftFootType: IK_TYPES.Off,
                rightFootType: IK_TYPES.Off,
                rightHandType: IK_TYPES.HipsRelativeRotationAndPosition,
                leftHandType: IK_TYPES.HipsRelativeRotationAndPosition,
                neckType: IK_TYPES.HipsRelativeRotationAndPosition,
                headType: IK_TYPES.HipsRelativeRotationAndPosition,
                isFlying: false,
                isNotMoving: true,
                ikOverlayAlpha: 1.0,
                isMovingForward: false,
                isMovingBackward: false,
                isMovingLeft: false,
                isMovingRight: false,
                isNotTurning: true,
                isTurningLeft: false,
                isTurningRight: false,
                inAirAlpha: 0.0
            };
        },
        sitDown: function() {
            // Don't need the ESC key interaction anymore
            // Controller.keyReleaseEvent.connect(this.keyReleaseEvent);
            if(HMD.active) {
                this.sitAnimationHandlerId = MyAvatar.addAnimationStateHandler(this.sitAnimationHMDHandler, 
                    [
                        "leftFootType",
                        "rightFootType",
                        "rightHandType",
                        "leftHandType",
                        "neckType", 
                        "headType",
                        "isFlying", 
                        "isNotMoving",
                        "ikOverlayAlpha",
                        "isMovingForward",
                        "isMovingBackward", 
                        "isMovingLeft",
                        "isMovingRight", 
                        "isNotTurning",
                        "isTurningLeft", 
                        "isTurningRight",
                        "inAirAlpha"
                    ]
                );
            } else {
                this.sitAnimationHandlerId = MyAvatar.addAnimationStateHandler(this.sitAnimationHandler, 
                    [
                        "isFlying", 
                        "isNotMoving",
                        "ikOverlayAlpha",
                        "isMovingForward",
                        "isMovingBackward", 
                        "isMovingLeft",
                        "isMovingRight", 
                        "isNotTurning",
                        "isTurningLeft", 
                        "isTurningRight",
                        "inAirAlpha"
                    ]
                );
            }

            // Not clicking on entity
            // Entities.clickReleaseOnEntity.disconnect(this.clickReleaseOnEntity); 
            // we move the avatar itself rather than using motion from the animation
            this.moveAvatarToChairCenter();
            var chairFront = Quat.multiply(_this.chairProperties.rotation, 
                                          Quat.fromPitchYawRollDegrees(0.0, HALF_CIRCLE, 0.0));

            this.seatedOrientation = Quat.mix(MyAvatar.orientation, chairFront,  1.0);
            MyAvatar.orientation = this.seatedOrientation;

            if(HMD.active) {
                MyAvatar.hmdLeanRecenterEnabled = false;
            } else {
                // look straight ahead
                MyAvatar.headPitch = 0;
                MyAvatar.headRoll = 0;
                MyAvatar.headYaw = 0;
                // set a short timeout so the head position is captured after moving
                Script.setTimeout(function() {
                    _this.overrideCameraMode(MyAvatar.getHeadPosition());
                    _this.handleOrbiting(0, 0);
                }, SHORT_DELAY);
            }

            MyAvatar.overrideRoleAnimation("fly", SIT_IDLE_ANIM.url, SIT_IDLE_ANIM.playbackRate,
                                           SIT_IDLE_ANIM.loopFlag, SIT_IDLE_ANIM.startFrame, SIT_IDLE_ANIM.endFrame);

            MyAvatar.overrideRoleAnimation("idleStand", SIT_IDLE_ANIM.url, SIT_IDLE_ANIM.playbackRate,
                                           SIT_IDLE_ANIM.loopFlag, SIT_IDLE_ANIM.startFrame, SIT_IDLE_ANIM.endFrame);

            MyAvatar.overrideRoleAnimation("idleTalk", SIT_IDLE_TALK_ANIM.url, SIT_IDLE_TALK_ANIM.playbackRate,
                                           SIT_IDLE_TALK_ANIM.loopFlag, SIT_IDLE_TALK_ANIM.startFrame,
                                           SIT_IDLE_TALK_ANIM.endFrame);

            Script.setTimeout(function() {
                _this.isStartingSit = false;
                _this.isSitting = true;
            }, LONG_DELAY);
            // ISSUE: currently not functioning
            // camera will drift if used with disabled controller
            // camera is now overriden on desktop, but may still be an issue on HMD
            // MyAvatar.setParentID(this.entityId);
        },
        standUp: function() {
            // Don't need the ESC key interaction anymore
            // Controller.keyReleaseEvent.disconnect(this.keyReleaseEvent);
            MyAvatar.overrideRoleAnimation("fly", FLY_ANIM.url, FLY_ANIM.playbackRate, FLY_ANIM.loopFlag,
                                           FLY_ANIM.startFrame, FLY_ANIM.endFrame);

            MyAvatar.overrideRoleAnimation("idleStand", IDLE_ANIM.url, IDLE_ANIM.playbackRate, IDLE_ANIM.loopFlag,
                                           IDLE_ANIM.startFrame, IDLE_ANIM.endFrame);

            MyAvatar.overrideRoleAnimation("idleTalk", IDLE_TALK_ANIM.url, IDLE_TALK_ANIM.playbackRate, 
                                           IDLE_TALK_ANIM.loopFlag, IDLE_TALK_ANIM.startFrame, IDLE_TALK_ANIM.endFrame);

            if(HMD.active) {
                MyAvatar.hmdLeanRecenterEnabled = true;
            } else {
                this.restoreCameraMode();
            }
            // ISSUE: As above parenting not functional
            // MyAvatar.setParentID(NULL_UUID);
            this.moveAvatarToChairFront();
            this.resetChairScale();
            Script.setTimeout(function() {
                MyAvatar.removeAnimationStateHandler(_this.sitAnimationHandlerId);
            }, VERY_SHORT_DELAY);
            Script.setTimeout(function() {
                _this.removeSitControllerMapping();
                _this.isSitting = false;
            }, SHORT_DELAY);
            // Not clicking on entity
            // Entities.clickReleaseOnEntity.connect(this.clickReleaseOnEntity);
        },
        clickReleaseOnEntity: function() {
            print("clicked chair!")
        },
        overrideCameraMode: function(focusTarget) {
            this.cameraTargetPosition = focusTarget;
            if(Camera.getModeString() == "third person" || Camera.getModeString() == "first person") {
                this.cameraLastMode = Camera.getModeString();
            }
            Camera.setModeString("independent");
            this.cameraPosition = Camera.getPosition();
            this.cameraVector = focusTarget;
            this.cameraRadius = CAMERA_ZOOM_MIN + 1.0;
            var normVec = Vec3.multiply(Quat.getFront(this.chairProperties.rotation), CAMERA_ZOOM_MIN + 1.0);
            this.azimuth = Math.atan2(normVec.z, normVec.x);
            this.altitude = 0;
            Controller.mouseMoveEvent.connect(_this.mouseMoveEvent);
        },
        restoreCameraMode: function() {
            Controller.mouseMoveEvent.disconnect(this.mouseMoveEvent)
            Camera.setModeString(this.cameraLastMode);
        },
        setSitControllerMapping: function () {
            this.sitEventMapping = Controller.newMapping(SIT_MAPPING_NAME);

            // I am trying to disable inputs to keep the avatar in the chair, is there a neater way to do this?
            // keyboard seems to map directly to actions
            this.sitEventMapping.from(Controller.Hardware.Keyboard.MouseMoveLeft).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.MouseMoveRight).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.MouseMoveUp).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.MouseMoveDown).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.MouseWheelLeft).to(function (value) {
                if(_this.cameraRadius < CAMERA_ZOOM_MAX) {
                    _this.cameraRadius += CAMERA_ZOOM_INCREMENT;
                    _this.handleOrbiting(0, 0);
                }
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.MouseWheelRight).to(function (value) {
                if(_this.cameraRadius > CAMERA_ZOOM_MIN) {
                    _this.cameraRadius -= CAMERA_ZOOM_INCREMENT;
                    _this.handleOrbiting(0, 0);
                }
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.RightMouseButton).to(function (value) {
                _this.rightMousePressed = value;
            });
            this.sitEventMapping.from(Controller.Standard.LX).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Standard.LY).to(function (value) {
                if(_this.isSitting && value < 0) {
                    _this.standUp();
                }
            });
            this.sitEventMapping.from(Controller.Standard.RX).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Standard.RY).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.W).to(function (value) {
                if(_this.isSitting && value != 0) {
                    _this.standUp();
                }
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.S).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.A).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.D).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.Left).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.Right).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.Up).to(function (value) {
                if(_this.isSitting && value == true) {
                    _this.standUp();
                }
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.Down).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.E).to(function (value) {
            });
            this.sitEventMapping.from(Controller.Hardware.Keyboard.C).to(function (value) {
            });

            Controller.enableMapping(SIT_MAPPING_NAME, true);
        },
        removeSitControllerMapping: function () {
            Controller.disableMapping(SIT_MAPPING_NAME);
        },
        orientationOf: function(vector) {
            var direction,
                yaw,
                pitch;

            direction = Vec3.normalize(vector);
            yaw = Quat.angleAxis(Math.atan2(direction.x, direction.z) * RAD_TO_DEG, Y_AXIS);
            pitch = Quat.angleAxis(Math.asin(-direction.y) * RAD_TO_DEG, X_AXIS);
            return Quat.multiply(yaw, pitch);
        },
        handleOrbiting: function(dx, dy) {
            this.azimuth += dx / AZIMUTH_RATE;
            this.altitude += dy / ALTITUDE_RATE;
            if (this.altitude > Math.PI * HALF) {
                this.altitude = Math.PI * HALF;
            }
            if (this.altitude < -Math.PI * HALF) {
                this.altitude = -Math.PI * HALF;
            }
            if(isNaN(this.azimuth) || isNaN(this.altitude)) {
                this.azimuth = 0;
                this.altitude = 0;
                return;
            }

            this.cameraVector = {
                x: (Math.cos(this.altitude) * Math.cos(this.azimuth)) * this.cameraRadius,
                y: Math.sin(this.altitude) * this.cameraRadius,
                z: (Math.cos(this.altitude) * Math.sin(this.azimuth)) * this.cameraRadius
            };
            this.cameraPosition = Vec3.sum(this.cameraTargetPosition, this.cameraVector);
            Camera.setPosition(this.cameraPosition);
            Camera.setOrientation(this.orientationOf(this.cameraVector));
        },
        keyReleaseEvent: function(event) {
            if (event.text == "ESC") {
                _this.standUp();
            }
            // ALT focusing disabled
            /*
            if (event.text == "ALT") {
                var pickRay = Camera.computePickRay(_this.mouseLastX, _this.mouseLastY);
                var modelIntersection = Entities.findRayIntersection(pickRay, true);
                if (modelIntersection.intersects && modelIntersection.accurate) {
                    if(modelIntersection.properties.dimensions.x < CAMERA_FOCUSOBJECT_MAX_SIZE &&
                        modelIntersection.properties.dimensions.y < CAMERA_FOCUSOBJECT_MAX_SIZE) {
                        _this.overrideCameraMode(modelIntersection.intersection);
                        _this.handleOrbiting(0, 0);
                    }
                }
            }
            */
        },
        mouseMoveEvent: function(event) {
            if(_this.rightMousePressed != 0) {
                if(!isNaN(event.x) && !isNaN(event.y)) {
                    _this.handleOrbiting(event.x - _this.mouseLastX, event.y - _this.mouseLastY);
               }
            }
            if(!isNaN(event.x) && !isNaN(event.y)) {
                _this.mouseLastX = event.x;
                _this.mouseLastY = event.y;
            }
        },
        preload: function(entityId) {
            this.entityId = entityId;
            this.getUserData();
            this.getChairSurface();
			this.makeDetectorZone(); // adds a new zone every time
            location.hostChanged.connect(this.hostChanged);
        },
        hostChanged: function(location) {
            if(this.isSitting) {
                this.standUp();
                MyAvatar.removeAnimationStateHandler(this.sitAnimationHandlerId);
                Controller.disableMapping(SIT_MAPPING_NAME);
            }
        },
        unload: function() {
            if(this.isSitting) {
                this.standUp();
                MyAvatar.removeAnimationStateHandler(this.sitAnimationHandlerId);
                Controller.disableMapping(SIT_MAPPING_NAME);
            }
            location.hostChanged.disconnect(this.hostChanged);
        }
    };

    // entity scripts always need to return a newly constructed object of our type
    return new ChairEntity();
});
