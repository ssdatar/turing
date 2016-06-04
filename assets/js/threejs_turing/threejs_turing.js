// ---------------------------------------------------------
// attach renderer to canvas
var SCENE_WIDTH = SCENE_HEIGHT = 700;
var canvas = document.getElementById("three");
var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(SCENE_WIDTH, SCENE_HEIGHT);

document.body.appendChild(renderer.domElement);

// Stats
stats = new Stats();
document.body.appendChild(stats.dom);
// scene - where we put our models
var scene = new THREE.Scene();

// camera - how we look at our scene
var camera = new THREE.PerspectiveCamera(45, SCENE_WIDTH / SCENE_HEIGHT, 1, 10000);
camera.position.set(SCENE_WIDTH, SCENE_HEIGHT, 700);

// central timekeeper
var clock = new THREE.Clock();

// parent object3D
var parent = new THREE.Object3D(),
    parent2 = new THREE.Object3D();

// controls
var controls = new THREE.OrbitControls(camera, canvas);

// ---------------------------------------------------------
// Perlin Noise Mesh

// add object
var p = new TuringMesh();
p.create_turing_pattern();
parent.add(p.donut);
scene.add(parent);

var gui = new dat.GUI();
var gui_a = gui.add(p, 'a', 0.1, 32);
gui_a.onChange(function(value) {
    p.a = value;
});

var gui_b = gui.add(p, 'b', 0.01, 1.6);
gui_b.onChange(function(value) {
    p.b = value;
});

var gui_scale_factor = gui.add(p, 'turing_scaling_factor', 1, 200);
gui_scale_factor.onChange(function(value) {
    p.turing_scaling_factor = value;
});

var gui_geom = gui.add(p, 'geom_value', ["Donut", "Knot", "Sphere"]).name('Geometry').listen();
gui_geom.onChange(function(value) {
    p.geom_value = value;

    if (value === "Donut") {
        parent.remove(p.mesh);
        parent.remove(p.mesh3);
        parent.remove(p.mesh7);
        parent.remove(p.mesh9);
        parent.add(p.donut);
    } else if (value === "Knot") {
        parent.remove(p.mesh);
        parent.remove(p.mesh3);
        parent.remove(p.donut);
        parent.add(p.mesh7);
        parent.add(p.mesh9);
    } else {
        p.shapeHasChanged = true;
        parent.remove(p.donut);
        parent.remove(p.mesh7);
        parent.remove(p.mesh9);
        parent.add(p.mesh);
        parent.add(p.mesh3);
    }
});

var gui_color = gui.addColor(p, 'mat3_color').name('Color').listen();
gui_color.onChange(function(value) {
    p.mesh3.material.emissive.setHex(value.replace("#", "0x"));
    p.mesh3.material.needsUpdate = true;
});

var gui_wireframe = gui.add(p, 'mat_wireframe', [true, false]).name('Wireframe').listen();
gui_wireframe.onChange(function(value) {

    var val = (value === "true");
    p.mesh.material.wireframe = val;
    p.mesh.material.needsUpdate = true;
});

var gui_rotation_x = gui.add(p, 'rotation_x', 0, 0.05).name('X-rotation');
gui_rotation_x.onChange(function(value) {
    p.rotation_x = value;
});

var gui_rotation_y = gui.add(p, 'rotation_y', 0, 0.05).name('Y-rotation');
gui_rotation_y.onChange(function(value) {
    p.rotation_y = value;
});


// ------------------------------------------------------------------------------------------------
// Lights


var ambientLight = new THREE.AmbientLight(0x000000);
scene.add(ambientLight);


// ------------------------------------------------------------------------------------------------
// draw loop

function draw() {
    // start stats recording
    stats.begin();

    // rotate parent
    parent.rotation.y += p.rotation_y;
    parent.rotation.x += p.rotation_x;

    // update mesh
    p.update_turing();

    // render scene
    renderer.render(scene, camera);

    // end stats recording
    stats.end();

    // run again
    requestAnimationFrame(draw);
}

// start animation
requestAnimationFrame(draw);
