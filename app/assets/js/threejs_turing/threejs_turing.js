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

var TuringMesh = function() {

  // Turing Pattern Parameters ------------------------------
 
  //set simulation parameters
  var N = 200;
  var T = 500;
  var dt = 0.01;
  var dx = 1;
  var dy = 1;



  var numStep = T / dt;
  var numComp = N / dx;

  //LE model parameters
  var Du = 1;
  var Dv = 1;
  this.a = 29.4;
  this.b = 1.555;
  var c = 1;
  var sigma = 20;

  //calculate alphas
  var alpha_u_x = Du * dt / (dx * dx);
  var alpha_u_y = Du * dt / (dy * dy);

  var alpha_v_x = c * Dv * dt / (dx * dx);
  var alpha_v_y = c * Dv * dt / (dy * dy);

  //create diag matris for FTCS scheme
  var A = numeric.diag(numeric.mul(-2, numeric.linspace(1, 1, numComp)));
  for (i = 0; i < numComp - 1; ++i) {
    A[i + 1][i] = A[i][i + 1] = 1
  };

  A[0][numComp - 1] = 1;
  A[numComp - 1][0] = 1;

  //set init values for u and v

  var ones_matrix = [];
  for (var i = 0; i < numComp; i++) {
    ones_matrix[i] = [];
    for (var j = 0; j < numComp; j++) {
      ones_matrix[i][j] = 1;
    }
  }

  var rand_matrix = [];
  for (var i = 0; i < numComp; i++) {
    rand_matrix[i] = [];
    for (var j = 0; j < numComp; j++) {
      rand_matrix[i][j] = Math.random();
    }
  }

  var zero_matrix = [];
  for (var i = 0; i < numComp; i++) {
    zero_matrix[i] = [];
    for (var j = 0; j < numComp; j++) {
      zero_matrix[i][j] = 0;
    }
  }

  var u = numeric.add(numeric.mul(0.15, ones_matrix), numeric.mul(0.02, rand_matrix));

  var v = numeric.add(numeric.mul(0.05, ones_matrix), numeric.mul(0.002, rand_matrix));

  var unew = zero_matrix;
  var vnew = zero_matrix;

  var mean_u = math.mean(u);
  var mean_v = math.mean(v);

  var normalMatrix2 = [],
      normalMatrix3 = [],
      normalMatrix4 = [];
  var originalVertices = [],
      originalVertices2 = [];

  // End Turing Pattern Parameters ---------------------------      


  //geometry parameters
  this.mesh_detail = numComp-1;
  this.position = new THREE.Vector3();
  this.velocity = new THREE.Vector3();
  this.radius = 200;
  this.thickness = 70;
  this.opacity = 1;
  this.turing_scaling_factor = 50;
  this.knot = true;
  this.torus = false;
  this.shapeHasChanged = false;


  this.create_turing_pattern = function() {
    //main geometry

    
    // if (this.knot) { 
        this.geometry = new THREE.SphereBufferGeometry(this.radius, this.thickness, parseInt(this.mesh_detail), parseInt(this.mesh_detail));
        this.geometry2 = new THREE.SphereBufferGeometry(this.radius,this.thickness, parseInt(this.mesh_detail), parseInt(this.mesh_detail));
        this.geom3 = new THREE.SphereBufferGeometry(this.radius,this.thickness/1.01, parseInt(this.mesh_detail), parseInt(this.mesh_detail));
      // }
    // if (this.torus) {
      this.geom4 = new THREE.TorusBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);
      this.geom5 = new THREE.TorusBufferGeometry(this.radius,this.thickness, this.mesh_detail, this.mesh_detail);
      this.geom6 = new THREE.TorusBufferGeometry(this.radius,this.thickness/1.01, this.mesh_detail, this.mesh_detail);
    // }
    this.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();

    this.geom4.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    this.geom4.computeFaceNormals();
    this.geom4.computeVertexNormals();

    this.material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0x111111,
      shading: THREE.SmoothShading,
      side: THREE.DoubleSide,
      wireframe: true,
      wireframeLinewidth: .001
    });
    this.material.transparent = true;
    this.material.opacity = this.opacity;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 0, 0);

    this.mesh4 = new THREE.Mesh(this.geom4, this.material);
    this.mesh4.position.set(0, 0, 0);

    //create matrix of normal vectors for the original surface
    this.edges = new THREE.VertexNormalsHelper( this.mesh, 1, 0x00ff00, 1 );
    normalMatrix = this.edges.geometry.attributes.position.array;
    for (var i = 0, j = 0, l = 39999; i < l; i++, j += 6){
        normalMatrix2.push([normalMatrix[j]-normalMatrix[j+3], normalMatrix[j+1]-normalMatrix[j+4], normalMatrix[j+2]-normalMatrix[j+5]]);
    }


    this.edges2 = new THREE.VertexNormalsHelper( this.mesh4, 1, 0x00ff00, 1 );
    normalMatrix3 = this.edges2.geometry.attributes.position.array;
    for (var i = 0, j = 0, l = 39999; i < l; i++, j += 6){
        normalMatrix4.push([normalMatrix3[j]-normalMatrix3[j+3], normalMatrix3[j+1]-normalMatrix3[j+4], normalMatrix3[j+2]-normalMatrix3[j+5]]);
    }

    //geometry used as reference for original points
    // this.geometry2 = new THREE.SphereBufferGeometry(this.radius,this.thickness, this.mesh_detail, this.mesh_detail);
    this.geometry2.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    originalVertices = this.geometry2.attributes.position.array;

    this.geom5.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    originalVertices2 = this.geom5.attributes.position.array;
//console.log(originalVertices2.length);

    //geometry for inner light
    // this.geom3 = new THREE.SphereBufferGeometry(this.radius,this.thickness/1.01, this.mesh_detail, this.mesh_detail);
    this.geom3.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    this.geom6.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    
    this.material3 = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0x43C6DB,
      shading: THREE.SmoothShading,
      side: THREE.DoubleSide,
      wireframe: false,
      wireframeLinewidth: .001
    });

    this.mesh3 = new THREE.Mesh(this.geom3, this.material3);
    this.mesh3.position.set(0, 0, 0);

    this.mesh5 = new THREE.Mesh(this.geom6, this.material3);
    this.mesh5.position.set(0, 0, 0);
   
  }
  this.update_turing = function() {

    // FTCS scheme for solving Lengyel-Epstein model ----
    uv = numeric.div(numeric.mul(u, v), numeric.add(1, numeric.mul(u, u)));

    u_1 = numeric.add(numeric.mul(alpha_u_x, numeric.dot(A, u)), numeric.mul(alpha_u_y, numeric.dot(u, A)));

    unew = numeric.add(u, numeric.add(u_1, numeric.mul(dt, numeric.add(numeric.add(this.a, numeric.mul(-1, u)), numeric.mul(-4, uv)))));

    v_1 = numeric.add(numeric.mul(alpha_v_x, numeric.dot(A, v)), numeric.mul(alpha_v_y, numeric.dot(v, A)));

    vnew = numeric.add(v, numeric.mul(sigma, numeric.add(numeric.mul(c, v_1), numeric.mul(dt, numeric.mul(this.b, numeric.add(u, numeric.mul(-1, uv)))))));

    u = unew;
    v = vnew;

    mean_u = math.mean(u);
    mean_v = math.mean(v);
    // End FTCS scheme for solving Lengyel-Epstein model ----
    
    // Normalize u
    temp = numeric.sub(u,math.min(u));
    temp = numeric.div(temp, math.max(temp));

    //update vertices by extending along the direction of the vertex normal vectors
    var vertices = this.geometry.attributes.position.array;
    var vertices2 = this.geom4.attributes.position.array;

    for (var i = 0, j = 0, l = 39999; i < l; i++, j += 3) {
      scalingFactor = this.turing_scaling_factor*temp[i % 199][Math.floor(i / 199)];
      
    if(this.knot) {
      vertices[j] = originalVertices[j] - scalingFactor*normalMatrix2[i][0];
      vertices[j+1] = originalVertices[j+1] - scalingFactor*normalMatrix2[i][1];
      vertices[j+2] = originalVertices[j+2] - scalingFactor*normalMatrix2[i][2];
     } 
    else {
      vertices2[j] = originalVertices2[j] - scalingFactor*normalMatrix4[i][0];
      vertices2[j+1] = originalVertices2[j+1] - scalingFactor*normalMatrix4[i][1];
      vertices2[j+2] = originalVertices2[j+2] - scalingFactor*normalMatrix4[i][2];
    }
  }
    
    
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh4.geometry.attributes.position.needsUpdate = true;
    p.mesh.geometry.computeFaceNormals();
    p.mesh.geometry.computeVertexNormals();

    p.mesh4.geometry.computeFaceNormals();
    p.mesh4.geometry.computeVertexNormals();


  }
}

// add object
var p = new TuringMesh();
p.create_turing_pattern();
parent.add(p.mesh);
parent.add(p.mesh3);

// parent2.add(p.mesh4);
// parent2.add(p.mesh5);

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

var gui_geom1 = gui.add(p, 'torus').listen();
gui_geom1.onChange(function(value) {
  p.torus = true;
  p.knot = false;
  p.shapeHasChanged = true;
  parent.remove(p.mesh);
  parent.remove(p.mesh3);
  parent.add(p.mesh4);
  parent.add(p.mesh5);
});

var gui_geom2 = gui.add(p, 'knot').listen();
gui_geom2.onChange(function(value) {
  p.torus = false;
  p.knot = true;
  p.shapeHasChanged = true;
  parent.remove(p.mesh4);
  parent.remove(p.mesh5);
  parent.add(p.mesh);
  parent.add(p.mesh3);

  console.log(parent);
  //console.log('chosen knot');
});





// ------------------------------------------------------------------------------------------------
// Lights


var ambientLight = new THREE.AmbientLight(0x000000);
scene.add(ambientLight);

var sphere = new THREE.SphereGeometry(50, 100, 50);
var dist_until_0 = 1500;
var lights = [];
lights[0] = new THREE.PointLight(0xaa9999, 1, dist_until_0);
lights[1] = new THREE.PointLight(0xaa9999, 1, dist_until_0);
lights[2] = new THREE.PointLight(0xffffff, 1, dist_until_0);

//x,z,y
// -SCENE_WIDTH => z=0 since we moved the scene by -2*SCENE_WIDTH
lights[0].position.set(SCENE_WIDTH, SCENE_WIDTH, SCENE_WIDTH);
lights[1].position.set(-SCENE_WIDTH, SCENE_WIDTH, SCENE_WIDTH);
lights[2].position.set(0, SCENE_WIDTH, -SCENE_WIDTH);

lights[0].add(new THREE.Mesh(sphere, new THREE.MeshLambertMaterial({
  color: 0xff0040
})));
lights[1].add(new THREE.Mesh(sphere, new THREE.MeshLambertMaterial({
  color: 0x0040ff
})));
lights[2].add(new THREE.Mesh(sphere, new THREE.MeshLambertMaterial({
  color: 0x80ff80
})));

scene.add(lights[0]);
scene.add(lights[1]);
scene.add(lights[2]);

light1 = new THREE.PointLight(0xff0040, 1, 300);
light1.add(new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({
  color: 0xff0040
})));
parent.add(light1);

light2 = new THREE.PointLight(0x0040ff, 1, 300);
light2.add(new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({
  color: 0x0040ff
})));
parent.add(light2);

light3 = new THREE.PointLight(0x80ff80, 1, 300);
light3.add(new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({
  color: 0x80ff80
})));
parent.add(light3);


// ------------------------------------------------------------------------------------------------
// draw loop

function draw() {
  // start stats recording
  stats.begin();

  // rotate parent
  parent.rotation.y += .002;
  parent.rotation.x += .004;

  parent2.rotation.y += .002;
  parent2.rotation.x += .004;

  // update mesh
  p.update_turing();
      

  // update lights
  var k = Date.now() * 0.0001,
      g = SCENE_WIDTH / 2;
  
  light1.position.x = Math.sin(k * 0.7) * g;
  light1.position.y = Math.cos(k * 0.5) * g;
  light1.position.z = Math.cos(k * 0.3) * g;
  light2.position.x = Math.cos(k * 0.3) * g;
  light2.position.y = Math.sin(k * 0.5) * g;
  light2.position.z = Math.sin(k * 0.7) * g;
  light3.position.x = Math.sin(k * 0.7) * g;
  light3.position.y = Math.cos(k * 0.3) * g;
  light3.position.z = Math.sin(k * 0.5) * g;

  // render scene
  renderer.render(scene, camera);

  // end stats recording
  stats.end();

  // run again
  requestAnimationFrame(draw);
}

// start animation
requestAnimationFrame(draw);