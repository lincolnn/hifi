// hand controller of Vive
// RHtoLH.js
// Created 21 November 2016
// This is a script that allows one controller(Vive) to move both hands in a mirrored fashion

// Mirror LEFT TO RIGHT
function mirrorRot(q) {
    return {x: q.x, y: -q.y, z: -q.z, w: q.w};
}

function mirrorPos(p) {
    return {x: -p.x, y: p.y, z: p.z}
}

var mirrorMapping = Controller.newMapping();

mirrorMapping.from(function(){
    var pose = Controller.getPoseValue(Controller.Standard.LeftHand);
    pose.rotation = mirrorRot(pose.rotation);
    pose.translation = mirrorPos(pose.translation);
    pose.velocity = mirrorPos(pose.velocity);
    pose.angularVelocity = mirrorPos(pose.angularVelocity);
    return pose;

}).to(Controller.Standard.RightHand);

mirrorMapping.enable();

Script.scriptEnding.connect(function() {
    mirrorMapping.disable();
});