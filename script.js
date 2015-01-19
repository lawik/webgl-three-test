
var needToRender = true; // Causes first render

var nodes = [];

function addNode(x,y,title,type) {
    nodes.push({
        x: x,
        y: y,
        title: title,
        type: type
    });
}

for(var i = 0; i <= 25; i++) {
    console.log("i:", i);
    addNode(i, i*i, 'Node: '+i, 'normal');
}

console.log("Nodes:", nodes);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.rotation.x = 45;

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', controlChange );
document.body.appendChild( renderer.domElement );

containerWidth = window.innerWidth;
containerHeight = window.innerHeight;

cubes = new THREE.Object3D();
flooring = new THREE.Object3D();

function onMouseUp(e) {
    // Get clicked object
    mouseVector = new THREE.Vector3();
    mouseVector.x = 2 * (e.clientX / containerWidth) - 1;
    mouseVector.y = 1 - 2 * ( e.clientY / containerHeight );
    var raycaster = new THREE.Raycaster();
    //console.log("Vector before unproject:", mouseVector);
    var vector = mouseVector.clone().unproject( camera );
    //console.log("Vector after unproject:", vector);
    //var direction = new THREE.Vector3( 0, 0, -1 ).transformDirection( camera.matrixWorld );
    var direction = new THREE.Vector3();
    //raycaster.set( vector, direction );
    raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
    var intersects = raycaster.intersectObjects( cubes.children );
    //console.log("Intersects:", intersects);
    for(var i in intersects) {
        var inter = intersects[i];
        console.log("Object label:", inter.object.label);
    }

    if(intersects.length > 0) {
        //panTo(intersects[0]);
        panTo(intersects[0]);
        needToRender = true;
    }

    // if(intersects.length > 0) {
    //     console.log(intersects[0].object.position);
    //     lineGeometry.vertices.push(intersects[0].object.position);
    // }

    //var line = new THREE.Line(lineGeometry, lineMaterial);
    //scene.add(line);
}

window.addEventListener('mouseup', onMouseUp, false);

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var floorPlane = new THREE.PlaneGeometry( 200, 200 );
var floorMaterial = new THREE.MeshBasicMaterial( { color: 0x333333 });
var material = new THREE.MeshBasicMaterial( { color: 0x00ffff } );
floorPlane.isFloor = true;
var floor = new THREE.Mesh( floorPlane, floorMaterial );
flooring.add( floor );
scene.add( flooring );

var lineMaterial = new THREE.LineBasicMaterial({
    color: 0xff0000
});
// var redThing = new THREE.MeshBasicMaterial( { color: 0xff0000 });
// var blupp = new THREE.BoxGeometry(2, 2, 2);
// var bluppmesh = new THREE.Mesh( blupp, redThing );
// scene.add(bluppmesh);
//var cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

// var light = new THREE.PointLight( 0xffffff, 1, 100 );
// light.position.set( 5, 10, 10 );
// scene.add( light );

function panTo(intersect) {
    var mesh = intersect.object;

    // Get camera focus
    var pLocal = new THREE.Vector3( 0, 0, -1 );
    var pWorld = pLocal.applyMatrix4( camera.matrixWorld );
    // vectorLikeCamera.applyQuaternion( camera.quaternion );

    //console.log("camera position:", camera.position);

    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(camera.position);
    lineGeometry.vertices.push(pWorld);
    var cameraDirectionVector = pWorld.sub( camera.position ).normalize();

    var raycastCamera = new THREE.Raycaster();
    raycastCamera.set( camera.position, cameraDirectionVector);
    var cameraIntersects = raycastCamera.intersectObjects( flooring.children );
    console.log(cameraIntersects);
    if(cameraIntersects.length > 0) {
        var planeIntersectVector = cameraIntersects[0].point;
        var newVector = mesh.position.clone();
        var offsetVector = newVector.sub( planeIntersectVector );
        console.log("offset:", offsetVector);
        console.log("cameraPosition pre-add:", camera.position);
        var newCameraPosition = camera.position.clone().add(offsetVector);
        console.log("cameraPosition post-add:", camera.position);

        //console.log("Intersects floor plane at:", planeIntersectVector);

        // var mesh_position = {
        //     x: mesh.position.x,
        //     y: mesh.position.y
        // };

        // var camera_position = {
        //     x: camera.position.x,
        //     y: camera.position.y
        // };

        console.log("Tweening!");
        var tweenCamera = new TWEEN.Tween(camera.position).to(newCameraPosition, 1500);
        tweenCamera.onUpdate(function () {
            console.log(camera.position);
            // console.log("Moving camera...");
            needToRender = true;
        });
        var tweenControls = new TWEEN.Tween(controls.center).to(mesh.position, 5000);
        tweenControls.onUpdate(function () {
            // console.log("Moving controls center...");
            needToRender = true;
        });

        needToRender = true;
        tweenCamera.start();
        tweenControls.start();
    } else {
        console.log("The hell, we couldn't find the floor!");
    }






    // update();
    // render();
}

camera.position.z = 5;

for(var i in nodes) {
    var cube = new THREE.Mesh( geometry, material );
    cube.position.x = nodes[i].x;
    cube.position.y = nodes[i].y;
    cube.label = i;
    nodes[i].mesh = cube;
    cubes.add(cube);
    //scene.add(cube);
    console.log("Adding cube:", i);
}
scene.add(cubes);

function controlChange() {
    needToRender = true;
    render();
}

function update() {
    controls.update();
}

function render() {
    requestAnimationFrame( render );
    if(needToRender) {
        renderer.render( scene, camera );
        floor.position.x = camera.position.x;
        floor.position.y = camera.position.y;
        needToRender = false;
        TWEEN.update();
    }

    //console.log("Render camera position:", camera.position);
}

render();

// function render() {
//     requestAnimationFrame( render );
//     //camera.position.y += 0.05;
//     //cube.rotation.y += 0.01;
//     //cube.rotation.x += 0.1;
//     //cube.rotation.z += 0.1;
//     renderer.render( scene, camera );
// }
// render();
