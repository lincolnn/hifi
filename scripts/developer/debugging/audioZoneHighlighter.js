// Written by Thoys
var overlays = [];
var settingsJSON = 'http://tofukozo.highfidelity.io:40100/settings.json?type=0';
var request = new XMLHttpRequest();
request.open('GET', settingsJSON, false);
request.send();
try {
    var response = JSON.parse(request.responseText);
    var audioZones = response['audio_env']['zones'];
    for (var audioZoneKey in audioZones) {
        print(audioZoneKey);
        var audioZone = audioZones[audioZoneKey];
        var audioZoneDimensions = {
            x: Math.abs(audioZone['x_min'] - audioZone['x_max']),
            y: Math.abs(audioZone['y_min'] - audioZone['y_max']),
            z: Math.abs(audioZone['z_min'] - audioZone['z_max'])
        };
        print(JSON.stringify(audioZoneDimensions));
        var audioZoneHalfDimensions = Vec3.multiply(audioZoneDimensions, 0.5);
        var audioZonePosition =  Vec3.sum({
                    x: Math.min(audioZone['x_min'], audioZone['x_max']),
                    y: Math.min(audioZone['y_min'], audioZone['y_max']),
                    z: Math.min(audioZone['z_min'], audioZone['z_max']),
                }, audioZoneHalfDimensions);
        print(JSON.stringify(audioZonePosition));
        overlays.push(Overlays.addOverlay('cube', {
            position: audioZonePosition,
            dimensions: audioZoneDimensions,
            alpha: 0.5,
            solid: true,
            visible: true,
        }));
    }
} catch (e) {
    print(e);
}

Script.scriptEnding.connect(function() {
    overlays.forEach(function(overlayID) {
        Overlays.deleteOverlay(overlayID);
    });
});