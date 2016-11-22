// Test AC Script For Eye Blink

// Script.include('example.json');
Script.include('https://hifi-content.s3.amazonaws.com/lincoln/muse-hifi/promises.js');
var Promise = loadPromise();

Agent.isAvatar=true;

var initnumch = 2;
var numCharacters = 2;

function get(url) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.onreadystatechange = function() {
            // print('req status:: ' + JSON.stringify(req.status))

            if (req.readyState == 4 && req.status == 200) {
                

                numCharacters = req.responseText.length;

                if (numCharacters - initnumch > 0){
                	// print("moves.." + req.responseText);

                	moveAvatar();
                	initnumch= numCharacters;
                }

                resolve(myArr).then(function(value) {
				        console.log(value); // "Success"
				});

            }
        };

        req.send();
    });
}


function moveAvatar() {
   print("move avatar..")
   var d = 5;
   var vecLookAt = Quat.getFront(Avatar.orientation);
   vecLookAt = Vec3.multiply(vecLookAt,d);
   var newLocation = Vec3.sum(vecLookAt, Avatar.position);
   Avatar.goToLocation(newLocation, true);    
}

// poll data from muse
function pollData() {
    // getJSON('https://blink-detector.herokuapp.com/eegs.json').then(function(err, data) {
    get('https://blink-detector.herokuapp.com/eegs.json');
}

Script.update.connect(pollData);