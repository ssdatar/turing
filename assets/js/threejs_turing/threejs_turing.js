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
parent.add(p.donut_light);
scene.add(parent);

//change a
var gui = new dat.GUI();
var gui_a = gui.add(p, 'a', 0.1, 32);
gui_a.onChange(function(value) {
    p.a = value;
});

//change b
var gui_b = gui.add(p, 'b', 0.01, 1.6);
gui_b.onChange(function(value) {
    p.b = value;
});

//change scale of pattern
var gui_scale_factor = gui.add(p, 'turing_scaling_factor', 1, 200);
gui_scale_factor.onChange(function(value) {
    p.turing_scaling_factor = value;
});

//change between geometries
var gui_geom = gui.add(p, 'geom_value', ["Donut", "Knot", "Sphere"]).name('Geometry').listen();
gui_geom.onChange(function(value) {
    p.geom_value = value;

    if (value === "Donut") {
        p.shapeHasChanged = true;   
        parent.remove(p.sphere);
        parent.remove(p.sphere_light);
        parent.remove(p.knot);
        parent.remove(p.knot_light);
        parent.add(p.donut);
        parent.add(p.donut_light);
    } else if (value === "Knot") {
        p.shapeHasChanged = true;   
        parent.remove(p.sphere);
        parent.remove(p.sphere_light);
        parent.remove(p.donut);
        parent.remove(p.donut_light);
        parent.add(p.knot);
        parent.add(p.knot_light);
    } else {
        p.shapeHasChanged = true;
        parent.remove(p.donut);
        parent.remove(p.knot);
        parent.remove(p.knot_light);
        parent.remove(p.donut_light);
        parent.add(p.sphere);
        parent.add(p.sphere_light);
    }
});

//change color of inner light
var gui_color = gui.addColor(p, 'mat3_color').name('Color').listen();
gui_color.onChange(function(value) {
    p.donut_light.material.emissive.setHex(value.replace("#", "0x"));
    p.donut_light.material.needsUpdate = true;
    p.knot_light.material.emissive.setHex(value.replace("#", "0x"));
    p.knot_light.material.needsUpdate = true;
    p.sphere_light.material.emissive.setHex(value.replace("#", "0x"));
    p.sphere_light.material.needsUpdate = true;
});

//turn on and off wirefram
var gui_wireframe = gui.add(p, 'mat_wireframe', [true, false]).name('Wireframe').listen();
gui_wireframe.onChange(function(value) {
    var val = (value === "true");
    p.mat_wireframe = val;
    p.donut.material.wireframe = val;
    p.knot.material.wireframe = val;   
    p.sphere.material.wireframe = val;
    p.donut.material.needsUpdate = true;
    p.knot.material.needsUpdate = true;   
    p.sphere.material.needsUpdate = true;
});

//adjust rotation rates in x and y
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

var dist_until_0 = 1500;
var lights = [];
lights[0] = new THREE.PointLight(0xaa9999, 1, dist_until_0);
lights[1] = new THREE.PointLight(0xaa9999, 1, dist_until_0);
lights[2] = new THREE.PointLight(0xffffff, 1, dist_until_0);

lights[0].position.set(SCENE_WIDTH, SCENE_WIDTH, SCENE_WIDTH);
lights[1].position.set(-SCENE_WIDTH, SCENE_WIDTH, SCENE_WIDTH);
lights[2].position.set(0, SCENE_WIDTH, -SCENE_WIDTH);

scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);

light1 = new THREE.PointLight(0xf91122, 1, 300);
parent.add(light1);

light2 = new THREE.PointLight(0x1122f9, 1, 300);
parent.add(light2);

light3 = new THREE.PointLight(0x22f911, 1, 300);
parent.add(light3);


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

    // update lights
    var k = Date.now() * 0.0001,
       g = SCENE_WIDTH / 2;
    light1.position.x = 0;
    light1.position.y = Math.cos(k * 0.7) * g/2;
    light1.position.z = Math.sin(k * 0.7) * g/2 - g/2;
    light1.rotateX( 0.1 );
    light1.rotateY( 0.1 );
    light2.position.x = 0.866*(Math.cos(k * 1) * g/2-g/2);
    light2.position.y = Math.sin(k * 1) * g/2;
    light2.position.z = -0.5*light2.position.x;
    light2.rotateX( 0.1 );
    light2.rotateY( 0.1 );
    light3.position.x = -0.866*(Math.sin(k * 2) * g/2-g/2);
    light3.position.y = Math.cos(k * 2) * g/2;
    light3.position.z = 0.5*light3.position.x;
    light3.rotateX( 0.1 );
    light3.rotateY( 0.1 );

    // render scene
    renderer.render(scene, camera);

    // end stats recording
    stats.end();

    // run again
    requestAnimationFrame(draw);
}

// start animation
requestAnimationFrame(draw);