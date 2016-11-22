(function() {
	var _this;

	var BALL_MODEL = "http://hifi-content.s3.amazonaws.com/Examples%20Content/production/pingpong/ball.fbx";

	Spawner = function() {
		_this = this;
	};

	Spawner.prototype = {
		preload: function(entityID) {
			this.entityID = entityID;
		},
		clickReleaseOnEntity: function(entityItemID, mouseEvent) {
			print("clicked!..")
		},

		startFarTrigger: function(entityItemID){
			var trayProperties = Entities.getEntityProperties(entityItemID);

			var properties = {
	            "age": 933.9415283203125,
	            "ageAsText": "0 hours 15 minutes 33 seconds",
	            "clientOnly": 0,
	            "collisionsWillMove": 1,
	            "created": "2016-11-02T22:25:51Z",
	            "density": 100,
	            "dimensions": {
	                "x": 0.040000006556510925,
	                "y": 0.040000021457672119,
	                "z": 0.040000010281801224
	            },
	            "dynamic": 1,
	            "gravity": {
	                "x": 0,
	                "y": -5,
	                "z": 0
	            },
	            "id": "{1d43820d-46c1-42d2-82d6-3f177bad7248}",
	            "lifetime": 3600,
	            "modelURL": BALL_MODEL,
	            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
	            "position": Vec3.sum(trayProperties.position, Entities.getEntityProperties(entityItemID).name === "Blue" ? {x: 1.38, y: 0.2, z: 0.2} : {x: -1.38, y: 0.2, z: -0.2}),
	            "queryAACube": {
	                "scale": 0.069282054901123047,
	                "x": 0.1656649112701416,
	                "y": 0.4662204384803772,
	                "z": 1.1258203983306885
	            },
	            "restitution": 0.99000000953674316,
	            "rotation": {
	                "w": 0.59896242618560791,
	                "x": -0.26530861854553223,
	                "y": -0.66530859470367432,
	                "z": 0.35814452171325684
	            },
	            "shapeType": "sphere",
	            "type": "Model",
	            "userData": "{}"			
			};	

			var paddleProperties = {
            "age": 1298.6383056640625,
            "ageAsText": "0 hours 21 minutes 38 seconds",
            "clientOnly": 0,
            "collisionsWillMove": 1,
            "created": "2016-11-02T22:19:18Z",
            "dimensions": {
                "x": 0.028670955449342728,
                "y": 0.37590110301971436,
                "z": 0.24051955342292786
            },
            "dynamic": 1,
            "gravity": {
                "x": 0,
                "y": -5,
                "z": 0
            },
            "id": "{ca8a94f4-67af-474c-959d-cbbf42834207}",
            "lifetime": 3600,
            "modelURL": "http://hifi-content.s3.amazonaws.com/Examples%20Content/production/pingpong/paddle" + trayProperties.name + ".fbx",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": Vec3.sum(trayProperties.position, Entities.getEntityProperties(entityItemID).name === "Blue" ? {x: 1.65, y: 0.2, z: 0.2} : {x: -1.65, y: 0.2, z: -0.2}),
            "queryAACube": {
                "scale": 0.447183758020401,
                "x": 0.20427219569683075,
                "y": 0.29727023839950562,
                "z": 2.2822065353393555
            },
            "restitution": 0.75,
            "rotation": {
                "w": -0.034622728824615479,
                "x": 0.70623326301574707,
                "y": -0.70629435777664185,
                "z": 0.034592151641845703
            },
            "shapeType": "simple-compound",
            "type": "Model",
            "userData": "{}"					
			};				

			Entities.addEntity(properties);
			Entities.addEntity(paddleProperties);
		},

	};

	return new Spawner();
});