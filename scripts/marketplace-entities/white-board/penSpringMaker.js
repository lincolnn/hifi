(function() {

    var SPRING_ENTITY_SCRIPT_URL = Script.resolvePath('springentity.js');

	function SpringEntity() {
		_this = this;
	}

	function createSpringEntity(){
		var originalProps = Entities.getEntityProperties(_this.entityID); 
        var props = {
            type: originalProps.type,
            name: 'SpringEntity:' + originalProps.name,
            modelURL: originalProps.modelURL,
            dimensions: originalProps.dimensions,
            description: _this.hand,
            restitution: 0,
            dynamic: true,
            collidesWith: 'dynamic,static,kinematic',
            rotation: originalProps.rotation,
            position: originalProps.position,
            shapeType: originalProps.shapeType,
            compoundShapeURL: originalProps.compoundShapeURL,
            visible: true,
            script: SPRING_ENTITY_SCRIPT_URL,
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: false
                }
            })
        }
        _this.springEntity = Entities.addEntity(props);		
	}

	function destroySpringEntity() {
		Entities.deleteEntity(_this.springEntity);
	}

	function enterPlayingMode() {
        if (Entities.getEntityProperties(_this.entityID).description.indexOf('active') > -1) {
            // print('already active dont duplicate')
            return
        }
        Entities.editEntity(_this.entityID, {
            description: 'active'
        });
        makeOriginalInvisible();
        createSpringEntity();
        createSpringAction();
	}

	function exitPlayingMode() {
        Entities.editEntity(_this.entityID, {
            description: ''
        });
        _this.lastSpringEntityProps = Entities.getEntityProperties(_this.springEntity);
        makeOriginalVisible();
        deleteSpringAction();
        destroySpringEntity();
	}

	function makeOriginalInvisible() {
        Entities.editEntity(_this.entityID, {
            visible: false,
            collisionless: true
        });		
	}

    function makeOriginalVisible() {
        Entities.editEntity(_this.entityID, {
            visible: true,
            collisionless: false,
            position: _this.lastSpringEntityProps.position,
            rotation: _this.lastSpringEntityProps.rotation,
            angularVelocity: {
                x: 0,
                y: 0,
                z: 0
            },
            velocity: {
                x: 0,
                y: 0,
                z: 0
            },
        });
    }

    function createSpringAction() {
        var targetProps = Entities.getEntityProperties(_this.entityID);

        var ACTION_TTL = 10; // seconds

        var props = {
            targetPosition: targetProps.position,
            targetRotation: targetProps.rotation,
            linearTimeScale: LINEAR_TIMESCALE,
            angularTimeScale: ANGULAR_TIMESCALE,
            tag: getTag(),
            ttl: ACTION_TTL
        };

        _this.actionID = Entities.addAction("spring", _this.springEntity, props);


        return;
    }

    function updateSpringAction() {
        // print('updating spring action::' + _this.actionID)
        var targetProps = Entities.getEntityProperties(_this.entityID);
        var ACTION_TTL = 10; // seconds

        var props = {
            targetPosition: targetProps.position,
            targetRotation: targetProps.rotation,
            linearTimeScale: LINEAR_TIMESCALE,
            angularTimeScale: ANGULAR_TIMESCALE,
            tag: getTag(),
            ttl: ACTION_TTL
        };

        var success = Entities.updateAction(_this.springEntity, _this.actionID, props);
        return;
    }

    function deleteSpringAction() {
        Entities.deleteAction(_this.springEntity, _this.actionID);
    }    

    function getTag() {
        return "springEntity-" + MyAvatar.sessionUUID;
    }

    SpringEntity.prototype = {
        springAction: null,
        springEntity: null,
        hand: null,
        preload: function(entityID) {
            _this.entityID = entityID;

        },
        startNearGrab: function(entityID, data) {
            _this.hand = data[0]
            enterPlayingMode();
        },
        continueNearGrab: function() {
            updateSpringAction();
        },
        releaseGrab: function() {
            exitPlayingMode();
        }
    };

    return new SpringEntity();

});