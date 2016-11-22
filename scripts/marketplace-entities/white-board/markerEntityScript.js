//
//  markerTipEntityScript.js
//
//  Created by Eric Levin on 2/17/15.
//  Additions by James B. Pollack @imgntn 6/9/2016
//  Additions by Lincoln Nguyen 11/11/2016
//  Copyright 2016 High Fidelity, Inc.
//
//  This script provides the logic for an object to draw marker strokes on its associated whiteboard

//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {

    Script.include('http://mpassets.highfidelity.com/eade2963-c737-497d-929f-b327cc5d7a48-v1/utils.js');
    var MAX_POINTS_PER_STROKE = 40;
    var _this;
    
    var isAudioReady = true;
    var PICK_SOUND_URL = "https://hifi-content.s3.amazonaws.com/lincoln/white-board/sounds/UISounds_SineClick04_gokhanbiyik.wav";
    var soundInjector = null;
    var pickSound = SoundCache.getSound(PICK_SOUND_URL);

    var pickSoundPlayFunction = function() {
        soundInjector = Audio.playSound(pickSound, { position: MyAvatar.position, volume: 0.8 });
    };

    // subscribe to channel 
    MarkerTip = function() {
        _this = this;
        _this.MARKER_TEXTURE_URL = "http://mpassets.highfidelity.com/eade2963-c737-497d-929f-b327cc5d7a48-v1/markerStroke.png";
        _this.strokeForwardOffset = 0.0001;
        _this.STROKE_WIDTH_RANGE = {
            min: 0.002,
            max: 0.01
        };
        _this.MIN_DISTANCE_BETWEEN_POINTS = 0.002;
        _this.MAX_DISTANCE_BETWEEN_POINTS = 0.1;
        _this.strokes = [];
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.WHITEBOARD_SURFACE_NAME = "hifi-whiteboardDrawingSurface";
        _this.MARKER_COLOR_NAME = "hifi-whiteboardPaint";
    };


    function handleColorMessage(channel, message, senderID) {
        if(channel == "Ink-Color") {
            setEntityCustomData("markerColor", _this.entityID, JSON.parse(message))
        }
    };

    Messages.subscribe("Ink-Color");
    Messages.messageReceived.connect(handleColorMessage);

    MarkerTip.prototype = {

        springAction: null,
        springEntity: null,
        hand: null,

        preload: function(entityID) {
            this.entityID = entityID;
            var pickSound = SoundCache.getSound(PICK_SOUND_URL);
        },

        startNearGrab: function() {
            _this.whiteboards = [];
            _this.colors = [];

            _this.markerColor = getEntityUserData(_this.entityID).markerColor;

            var markerProps = Entities.getEntityProperties(_this.entityID);
            _this.DRAW_ON_BOARD_DISTANCE = markerProps.dimensions.z / 2;
            var markerPosition = markerProps.position;
            var results = Entities.findEntities(markerPosition, 5);
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === _this.WHITEBOARD_SURFACE_NAME) {
                    _this.whiteboards.push(entity);
                } else if (entityName === _this.MARKER_COLOR_NAME) {
                    _this.colors.push(entity)
                }
            });
        },

        releaseGrab: function() {
            _this.resetStroke();
        },

        continueNearGrab: function(ID, paramsArray) {
            // cast a ray from marker and see if it hits anything
            var markerProps = Entities.getEntityProperties(_this.entityID);

            //need to back up the ray to the back of the marker 

            var markerFront = Quat.getFront(markerProps.rotation);
            var howFarBack = markerProps.dimensions.z / 2;
            var pulledBack = Vec3.multiply(markerFront, -howFarBack);
            var backedOrigin = Vec3.sum(markerProps.position, pulledBack);

            var pickRay = {
                origin: backedOrigin,
                direction: Quat.getFront(markerProps.rotation)
            }
            

            var ColorIntersection = Entities.findRayIntersection(pickRay, true, _this.colors);

            if(ColorIntersection.intersects && Vec3.distance(ColorIntersection.intersection, markerProps.position) <= _this.DRAW_ON_BOARD_DISTANCE) {

                // play sound
                if (pickSound.downloaded) {

                    if(isAudioReady) {
                        pickSoundPlayFunction();
                        isAudioReady = false;

                        Script.setTimeout(function() { 
                            isAudioReady = true;
                        }, 100);                    
                    }   
                    
                } else {
                    pickSound.ready.connect(pickSoundPlayFunction);
                }          
                      
                _this.markerColor = getEntityUserData(ColorIntersection.entityID).markerColor;

                setEntityUserData(_this.entityID, {"markerColor": _this.markerColor})
            }

            // update color
            _this.markerColor = getEntityUserData(_this.entityID).markerColor;

            var intersection = Entities.findRayIntersection(pickRay, true, _this.whiteboards);

            if (intersection.intersects && Vec3.distance(intersection.intersection, markerProps.position) <= _this.DRAW_ON_BOARD_DISTANCE) {
                _this.currentWhiteboard = intersection.entityID;
                var whiteboardRotation = Entities.getEntityProperties(_this.currentWhiteboard, "rotation").rotation;
                _this.whiteboardNormal = Quat.getFront(whiteboardRotation);

                _this.paint(intersection.intersection)
            
                hand = paramsArray[0] === 'left' ? 0 : 1;
                var vibrated = Controller.triggerHapticPulse(1, 70, hand);

            } else {
                if (_this.currentStroke) {
                    _this.resetStroke();
                }

            }
        },

        startEquip: function() {
            _this.startNearGrab();
        },

        continueEquip: function(ID, paramsArray) {
            _this.continueNearGrab(ID, paramsArray);
        },

        releaseEquip: function() {
            _this.releaseGrab();
        },

        newStroke: function(position) {
            _this.strokeBasePosition = position;
            _this.currentStroke = Entities.addEntity({
                type: "PolyLine",
                name: _this.STROKE_NAME,
                dimensions: {
                    x: 10,
                    y: 10,
                    z: 10
                },
                position: position,
                textures: _this.MARKER_TEXTURE_URL,
                color: _this.markerColor,
                lifetime: 5000
            });

            _this.linePoints = [];
            _this.normals = [];
            _this.strokes.push(_this.currentStroke);
        },

        paint: function(position) {
            var basePosition = position;
            if (!_this.currentStroke) {
                if (_this.oldPosition) {
                    basePosition = _this.oldPosition;
                }
                _this.newStroke(basePosition);
            }

            var localPoint = Vec3.subtract(basePosition, _this.strokeBasePosition);
            localPoint = Vec3.sum(localPoint, Vec3.multiply(_this.whiteboardNormal, _this.strokeForwardOffset));

            if (_this.linePoints.length > 0) {
                var distance = Vec3.distance(localPoint, _this.linePoints[_this.linePoints.length - 1]);
                if (distance < _this.MIN_DISTANCE_BETWEEN_POINTS) {
                    return;
                }
            }
            _this.linePoints.push(localPoint);
            _this.normals.push(_this.whiteboardNormal);

            var strokeWidths = [];
            var i;
            for (i = 0; i < _this.linePoints.length; i++) {
                // Create a temp array of stroke widths for calligraphy effect - start and end should be less wide
                var pointsFromCenter = Math.abs(_this.linePoints.length / 2 - i);
                var pointWidth = map(pointsFromCenter, 0, this.linePoints.length / 2, _this.STROKE_WIDTH_RANGE.max, this.STROKE_WIDTH_RANGE.min);
                strokeWidths.push(pointWidth);
            }

            Entities.editEntity(_this.currentStroke, {
                linePoints: _this.linePoints,
                normals: _this.normals,
                strokeWidths: strokeWidths
            });

            if (_this.linePoints.length > MAX_POINTS_PER_STROKE) {
                Entities.editEntity(_this.currentStroke, {
                    parentID: _this.currentWhiteboard
                });
                _this.currentStroke = null;
                _this.oldPosition = position;
            }
        },

        resetStroke: function() {

            Entities.editEntity(_this.currentStroke, {
                parentID: _this.currentWhiteboard
            });
            _this.currentStroke = null;

            _this.oldPosition = null;
        },

        clickReleaseOnEntity: function() {
            print("testing")
            if (pickSound.downloaded) {
                pickSoundPlayFunction();
            } else {
                pickSound.ready.connect(pickSoundPlayFunction);
            }        
        },

        unload: function() {
            if (soundInjector !== null && soundInjector.isPlaying()) {
                soundInjector.stop();
            }
        }        
    };

    return new MarkerTip();
});