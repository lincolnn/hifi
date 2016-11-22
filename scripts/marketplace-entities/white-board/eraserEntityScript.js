//
//  eraserEntityScript.js
//
//  Created by Eric Levin on 2/17/15.
//  Additions by James B. Pollack @imgntn 6/9/2016
//  Additions by Lincoln Nguyen 11/11/2016
//  Copyright 2016 High Fidelity, Inc.
//
//  This entity script provides logic for an object with attached script to erase nearby marker strokes
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    Script.include('http://mpassets.highfidelity.com/eade2963-c737-497d-929f-b327cc5d7a48-v1/utils.js');

    var _this; 
    var WIPE_SOUND_URL = "https://hifi-content.s3.amazonaws.com/lincoln/white-board/sounds/wipeSlate.wav";

    var soundInjector = null;
    var wipeSound = SoundCache.getSound(WIPE_SOUND_URL);

    var wipeSoundPlayFunction = function() {
        soundInjector = Audio.playSound(wipeSound, { position: MyAvatar.position, volume: 0.8 });
    };

    Eraser = function() {
        _this = this;
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.ERASER_TO_STROKE_SEARCH_RADIUS = 0.1;
    };

    Eraser.prototype = {

        continueNearGrab: function() {
            _this.eraserPosition = Entities.getEntityProperties(_this.entityID, "position").position;
            _this.continueHolding();
        },

        continueHolding: function() {
            var results = Entities.findEntities(_this.eraserPosition, _this.ERASER_TO_STROKE_SEARCH_RADIUS);
            // Create a map of stroke entities and their positions

            results.forEach(function(stroke) {
                var props = Entities.getEntityProperties(stroke, ["position", "name"]);
                if (props.name === _this.STROKE_NAME && Vec3.distance(_this.eraserPosition, props.position) < _this.ERASER_TO_STROKE_SEARCH_RADIUS) {
                    Entities.deleteEntity(stroke);
                    // play wipe sound
                    if (wipeSound.downloaded) {
                        wipeSoundPlayFunction();
                    } else {
                        wipeSound.ready.connect(wipeSoundPlayFunction);
                    }
                }
            });
        },

        preload: function(entityID) {
            _this.entityID = entityID;
            
        },

        startEquip: function() {
            _this.startNearGrab();
        },

        continueEquip: function() {
            _this.continueNearGrab();
        },

        clickReleaseOnEntity: function() {
            print("clicked.")
        },

        unload: function() {
            if (soundInjector !== null && soundInjector.isPlaying()) {
                soundInjector.stop();
            }
        }


    };

    return new Eraser();
});