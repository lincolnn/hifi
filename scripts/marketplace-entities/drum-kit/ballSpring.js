(function() {
	
	var _this;

    // var RANGE = 5.0;
    // var AUDIO_RANGE = 0.5 * RANGE;
    // var cameraAxis = Quat.getFront(Camera.getOrientation());
    // var audioPosition = Vec3.sum(Camera.getPosition(), Vec3.multiply(AUDIO_RANGE, cameraAxis));
    // var audioOptions = { volume: 0.9, position: audioPosition };
    var isAudioReady = true;

    var COLLISION_EVENT_TYPE = {
        START: 0,
        CONTINUE: 1,
        END: 2
    };

    var RED = {
        red: 255,
        green: 0,
        blue: 0
    };

    var ORANGE = {
        red: 255,
        green: 165,
        blue: 0
    };

    var YELLOW = {
        red: 255,
        green: 255,
        blue: 0
    };

    var GREEN = {
        red: 0,
        green: 255,
        blue: 0
    };

    var BLUE = {
        red: 0,
        green: 0,
        blue: 255
    };

    var INDIGO = {
        red: 128,
        green: 0,
        blue: 128
    };

    var VIOLET = {
        red: 75,
        green: 0,
        blue: 130
    };

    var colors = [RED, ORANGE, YELLOW, GREEN, BLUE, INDIGO, VIOLET];

    function playAudio(clip) {
        var soundInjector = Audio.playSound(clip, audioOptions);
    }

	Spring = function() {
		_this = this;
	}

	Spring.prototype = {
		entityID: null,
		sound: null, 
		injector: null,

		preload: function(entityID) { 
			_this.entityID = entityID;
			// Script.setTimeout(function() {
				var SOUND_URL = "https://hifi-content.s3.amazonaws.com/lincoln/sounds/"  + Entities.getEntityProperties(entityID).name + ".wav";
				_this.hitSound = SoundCache.getSound(SOUND_URL);
			// }, 250)
		},
		clickReleaseOnEntity: function(entityID, mouseEvent){
			print("clicked!")
			// _this.explode();
			// playAudio(_this.hitSound);
			_this.playAudioAtContact(_this.hitSound);
			_this.light();
			
		},
		collisionWithEntity: function(me, otherEntity,collision){
			print("collision..")
			// _this.explode();

			if(collision.type !== 0) {
				return
			}

            if(isAudioReady) {
            	// playAudio(_this.hitSound);
            	_this.playAudioAtContact(_this.hitSound);
            	isAudioReady = false;

				Script.setTimeout(function() { 
                    isAudioReady = true;
                }, 100);	            	
            }	

            _this.light();
            
		},
		explode: function() {
			print("explode.")
            var myProps = Entities.getEntityProperties(_this.entityID);
            var color = colors[Math.floor(Math.random() * colors.length)];
            var explosionParticleProperties = {
                "color": color,
                "isEmitting": 1,
                "maxParticles": 1000,
                "lifespan": 0.25,
                "emitRate": 1,
                "emitSpeed": 0.1,
                "speedSpread": 1,
                "emitOrientation": Quat.getUp(myProps.rotation),
                "emitDimensions": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "polarStart": 0,
                "polarFinish": 0,
                "azimuthStart": 0,
                "azimuthFinish": 0,
                "emitAcceleration": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "accelerationSpread": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "particleRadius": 0.829,
                "radiusSpread": 0,
                "radiusStart": 0.361,
                "radiusFinish": 0.294,
                "colorSpread": {
                    "red": 0,
                    "green": 0,
                    "blue": 0
                },
                "colorStart": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "colorFinish": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "alpha": 1,
                "alphaSpread": 0,
                "alphaStart": -0.2,
                "alphaFinish": 0.5,
                "emitterShouldTrail": 0,
                "textures": "https://hifi-content.s3.amazonaws.com/lincoln/img/explode.png",
                "type": "ParticleEffect",
                lifetime: 1,
                position: myProps.position
            };

            var explosion = Entities.addEntity(explosionParticleProperties);

		},
		playAudioAtContact: function(sound) {
			var audioProps = {
				volume: 0.5, 
				position: Entities.getEntityProperties(_this.entityID).position
			};

			Audio.playSound(sound, audioProps)
		}, 
		light: function() {

			var myProps = Entities.getEntityProperties(_this.entityID);
			var color = colors[Math.floor(Math.random() * colors.length)];

			var lightProperties = {
	            "clientOnly": 0,
	            "color": color,
	            "created": "2016-10-10T23:14:12Z",
	            "cutoff": 90,
	            "dimensions": {
	                "x": 0.72997760772705078,
	                "y": 0.72997760772705078,
	                "z": 0.72997760772705078
	            },
	            "falloffRadius": 5,
	            "id": "{cd5b4b26-55c4-4f48-8afa-ad6e49e324e5}",
	            "intensity": 100,
	            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
	            "queryAACube": {
	                "scale": 1.2643582820892334,
	                "x": -0.6321791410446167,
	                "y": -0.6321791410446167,
	                "z": -0.6321791410446167
	            },
	            "rotation": {
	                "w": 1,
	                "x": -1.52587890625e-05,
	                "y": -1.52587890625e-05,
	                "z": -1.52587890625e-05
	            },
	            "type": "Light",
	            "lifetime": 0.1,
	            "position": {
	            	"x": myProps.position.x,
	            	"y": myProps.position.y + 0.23,
	            	"z": myProps.position.z
	            }
	        }

	        var light = Entities.addEntity(lightProperties);

		}		
	}

	return new Spring();
})