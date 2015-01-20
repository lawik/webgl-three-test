var nodes = [];

var needToRender = true; // Causes first render

function goRender() {
    needToRender = true;
}

function openDialog(mesh) {
    $(".dialog").remove();
    $("body").append('<div class="dialog"><h2>'+mesh.label+'</h2><div class="dialog-body"><p>Lorem ipsum dolor sit amet.</p></div></div>');
}

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

// STATS

var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms

// align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );

// SCENE

console.log("Nodes:", nodes);

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
//controls = new THREE.OrbitControls( camera, renderer.domElement );
//controls = new THREE.MouseControls( camera );
controls = new THREE.EditorControls( camera, renderer.domElement );
controls.addEventListener( 'change', controlChange );
//this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };
//controls.noRotate = true;

controls.keyPanSpeed = 14.0;  // pixels moved per arrow key push
controls.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.LEFT };
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

//var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var geometry = new THREE.CylinderGeometry(1, 1, 1, 200, 200);
var floorPlane = new THREE.PlaneGeometry( 200, 200 );
var floorMaterial = new THREE.MeshBasicMaterial( { color: 0x7ec3f2 });
var material = new THREE.MeshLambertMaterial( { color: 0x00cc00 } );
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

var light = new THREE.PointLight( 0xffffff, 1, 100 );
light.position.set( 5, 10, 10 );
scene.add( light );

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
        var tweenCamera = new TWEEN.Tween(camera.position).to(newCameraPosition, 1000);
        controls.enabled = false;
        tweenCamera.onUpdate(function () {
            //console.log(camera.position);
            // controls.center = camera.position.clone();
            // controls.center.z = 0;
            // console.log("controls center: ", controls.center);
            // console.log("Moving camera...");
            console.log("Tween updated...");
            needToRender = true;
        });
        tweenCamera.onComplete(function () {
            console.log("Done tweening!");
            //controls.center = mesh.position.clone();
            controls.focus(mesh);
            //controls.target = mesh.position.clone();
            //console.log("controls center: ", controls.center);
            controls.enabled = true;

            openDialog(mesh);
            //update();
        });
        // var tweenControls = new TWEEN.Tween(controls.center).to(mesh.position, 5000);
        // tweenControls.onUpdate(function () {
        //     // console.log("Moving controls center...");
        //     needToRender = true;
        // });

        needToRender = true;
        tweenCamera.start();
        // tweenControls.start();
    } else {
        console.log("The hell, we couldn't find the floor!");
    }

    // update();
    // render();
}

for(var i in nodes) {
    var cube = new THREE.Mesh( geometry, material );
    cube.position.x = nodes[i].x;
    cube.position.y = nodes[i].y;
    cube.label = "Node #"+i;
    cube.rotation.x = (90 * (Math.PI / 180));
    nodes[i].mesh = cube;
    cubes.add(cube);
    //scene.add(cube);
    console.log("Adding cube:", i);
}
scene.add(cubes);

function controlChange() {
    //console.log(controls);
    //console.log("Controls center: ", controls.center);
    needToRender = true;
    //render();
}

function update() {
    controls.update();
}

function render() {
    //needToRender = true;
    requestAnimationFrame( render );
//    console.log("Render?", needToRender);
    if(needToRender) {
        console.log("Rendering...");
        stats.begin();
        renderer.render( scene, camera );

        // floor.position.x = camera.position.x;
        // floor.position.y = camera.position.y;
        needToRender = false;
        TWEEN.update();
        stats.end();
    }

    //console.log("Render camera position:", camera.position);
}

camera.position.z = 5;
camera.rotation.x = (45 * (Math.PI / 180));
console.log(camera.quaternion);

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
