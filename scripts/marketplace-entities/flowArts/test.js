Script.include("https://hifi-content.s3.amazonaws.com/lincoln/utils.js");
Script.include("https://hifi-content.s3.amazonaws.com/lincoln/flowArts/raveStick/raveStick.js");
Script.include("https://hifi-content.s3.amazonaws.com/lincoln/flowArts/lightSaber/lightSaber.js");
Script.include("https://hifi-content.s3.amazonaws.com/lincoln/flowArts/lightBall/lightBall.js");
Script.include("https://hifi-content.s3.amazonaws.com/lincoln/flowArts/arcBall/arcBall.js");


var basePosition = Vec3.sum(MyAvatar.position, Vec3.multiply(1, Quat.getFront(Camera.getOrientation())));
basePosition.y = MyAvatar.position.y;

var raveStick = new RaveStick(Vec3.sum(basePosition, {x: 1, y: 0.5, z: 1}));

var lightSaber = new LightSaber(Vec3.sum(basePosition, {x: 3, y: 0.5, z: 1}));

var lightBall = new LightBall(basePosition);

var arcBall = new ArcBall(basePosition);
var arcBall2 = new ArcBall(Vec3.sum(basePosition, {x: -1, y: 0, z: 0}));