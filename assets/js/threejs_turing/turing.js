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

    //create common helper matrices
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

    //set random init values for u and v
    var u = numeric.add(numeric.mul(0.15, ones_matrix), numeric.mul(0.02, rand_matrix));
    var v = numeric.add(numeric.mul(0.05, ones_matrix), numeric.mul(0.002, rand_matrix));

    //create empty dummy matrices
    var unew = zero_matrix;
    var vnew = zero_matrix;

    // End Turing Pattern Parameters ---------------------------      

    //initialize arrays/matrices for geometries
    var sphere_matrix = [],
        donut_matrix = [],
        knot_matrix = [];
    var originalsphere_vertices = [],
        originaldonut_vertices = [],
        originalknot_vertices = [];

    //geometry parameters
    this.mesh_detail = numComp - 1;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.radius = 200;
    this.thickness = 70;
    this.opacity = 1;
    this.turing_scaling_factor = 50;
    this.geom_value = "Donut";
    this.shapeHasChanged = false;
    this.mat3_color = 0x43C6DB;
    this.mat_wireframe = true;
    this.turing_scaling_factor = 50;
    this.rotation_x = 0.004;
    this.rotation_y = 0.002;

    //create material for the outer mesh w/ pattern
    this.create_material = function(){
        this.material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            emissive: 0x111111,
            shading: THREE.SmoothShading,
            side: THREE.DoubleSide,
            wireframe: this.mat_wireframe,
            wireframeLinewidth: .001
        });
        this.material.transparent = true;
        this.material.opacity = this.opacity;
    }

    //create material for inner mesh w/ light
    this.create_inner_light_material = function(){
        this.material_light = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            emissive: 0x43C6DB,
            shading: THREE.SmoothShading,
            side: THREE.DoubleSide,
            wireframe: false,
            wireframeLinewidth: .001
        });
    }

    //create donut geometry
    this.create_donut = function(){
        //create donut geometry for turing pattern
        this.donut_geometry = new THREE.TorusBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);
        this.donut_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.donut_geometry.computeFaceNormals();
        this.donut_geometry.computeVertexNormals();
        this.donut = new THREE.Mesh(this.donut_geometry, this.material);
        this.donut.position.set(0, 0, 0);

        //calculate normals for each vertex in the default geometry and store in a matrix
        this.edges_donut = new THREE.VertexNormalsHelper(this.donut, 1, 0x00ff00, 1);
        normalMatrix3 = this.edges_donut.geometry.attributes.position.array;
        for (var i = 0, j = 0, l = 39999; i < l; i++, j += 6) {
            donut_matrix.push([normalMatrix3[j] - normalMatrix3[j + 3], normalMatrix3[j + 1] - normalMatrix3[j + 4], normalMatrix3[j + 2] - normalMatrix3[j + 5]]);
        }

        //create dummy copy of geometry to create reference or original position vector.
        //if these reference position vectors are create off the same geometry used for the pattern,
        //it will update every frame for some reason...
        this.dummy_donut_geometry = new THREE.TorusBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);
        this.dummy_donut_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        originaldonut_vertices = this.dummy_donut_geometry.attributes.position.array;

        //create donut geometry for internal light
        this.donut_light_geometry = new THREE.TorusBufferGeometry(this.radius, this.thickness / 1.2, this.mesh_detail, this.mesh_detail);
        this.donut_light_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.donut_light = new THREE.Mesh(this.donut_light_geometry, this.material_light);
        this.donut_light.position.set(0, 0, 0); 
    }

    //create knot geometry
    this.create_knot = function(){
        //create knot geometry for turing pattern
        this.knot_geometry = new THREE.TorusKnotBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);
        this.knot_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.knot_geometry.computeFaceNormals();
        this.knot_geometry.computeVertexNormals();
        this.knot = new THREE.Mesh(this.knot_geometry, this.material);
        this.knot.position.set(0, 0, 0);

        //calculate normals for each vertex in the default geometry and store in a matrix
        this.edges_knot = new THREE.VertexNormalsHelper(this.knot, 1, 0x00ff00, 1);
        var normalMatrix = this.edges_knot.geometry.attributes.position.array;
        for (var i = 0, j = 0, l = 39999; i < l; i++, j += 6) {
            knot_matrix.push([normalMatrix[j] - normalMatrix[j + 3], normalMatrix[j + 1] - normalMatrix[j + 4], normalMatrix[j + 2] - normalMatrix[j + 5]]);
        }

        //create dummy copy of geometry to create reference or original position vector
        this.dummy_knot_geometry = new THREE.TorusKnotBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);        
        this.dummy_knot_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        originalknot_vertices = this.dummy_knot_geometry.attributes.position.array;

        //create geometry for internal light
        this.knot_light_geometry = new THREE.TorusKnotBufferGeometry(this.radius, this.thickness / 1.2, this.mesh_detail, this.mesh_detail);
        this.knot_light_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.knot_light = new THREE.Mesh(this.knot_light_geometry, this.material_light);
        this.knot_light.position.set(0, 0, 0);
    }

    //create sphere geometry
    this.create_sphere = function(){
        //create sphere geometry for turing pattern
        this.sphere_geometry = new THREE.SphereBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);        
        this.sphere_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.sphere_geometry.computeFaceNormals();
        this.sphere_geometry.computeVertexNormals();        
        this.sphere = new THREE.Mesh(this.sphere_geometry, this.material);
        this.sphere.position.set(0, 0, 0);

        //calculate normals for each vertex in the default geometry and store in a matrix
        this.edges_sphere = new THREE.VertexNormalsHelper(this.sphere, 1, 0x00ff00, 1);
        var normalMatrix = this.edges_sphere.geometry.attributes.position.array;
        for (var i = 0, j = 0, l = 39999; i < l; i++, j += 6) {
            sphere_matrix.push([normalMatrix[j] - normalMatrix[j + 3], normalMatrix[j + 1] - normalMatrix[j + 4], normalMatrix[j + 2] - normalMatrix[j + 5]]);
        }
        
        //create dummy copy of geometry to create reference or original position vector
        this.dummy_sphere_geometry = new THREE.SphereBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);
        this.dummy_sphere_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        originalsphere_vertices = this.dummy_sphere_geometry.attributes.position.array;
        
        //create geometry for internal light
        this.sphere_light_geometry = new THREE.SphereBufferGeometry(this.radius, this.thickness / 1.2, this.mesh_detail, this.mesh_detail);        
        this.sphere_light_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));      
        this.sphere_light = new THREE.Mesh(this.sphere_light_geometry, this.material_light);
        this.sphere_light.position.set(0, 0, 0);
    }

    this.create_turing_pattern = function() {
        
        this.create_material();

        this.create_inner_light_material(); 

        this.create_donut();

        this.create_knot();

        this.create_sphere();              

    }

    this.update_turing = function() {

        this.ftcs_LE_model();

        // Normalize u
        normalizedU = numeric.sub(u, math.min(u));
        normalizedU = numeric.div(normalizedU, math.max(normalizedU));

        //update the current geometry
        if(this.geom_value === "Donut"){

            var donut_vertices = this.donut_geometry.attributes.position.array;
         
            for (var i = 0, j = 0, l = 39999; i < l; i++, j += 3) {
                scalingFactor = this.turing_scaling_factor * normalizedU[i % 199][Math.floor(i / 199)];
                
                donut_vertices[j] = originaldonut_vertices[j] - scalingFactor * donut_matrix[i][0];
                donut_vertices[j + 1] = originaldonut_vertices[j + 1] - scalingFactor * donut_matrix[i][1];
                donut_vertices[j + 2] = originaldonut_vertices[j + 2] - scalingFactor * donut_matrix[i][2];
            }

            this.donut.geometry.attributes.position.needsUpdate = true;

            if(this.mat_wireframe === false){
                this.donut.geometry.computeFaceNormals();
            }

            this.donut.geometry.computeVertexNormals();
        }

        if(this.geom_value === "Knot"){

            var knot_vertices = this.knot_geometry.attributes.position.array;
    
            for (var i = 0, j = 0, l = 39999; i < l; i++, j += 3) {
                scalingFactor = this.turing_scaling_factor * normalizedU[i % 199][Math.floor(i / 199)];
                    
                knot_vertices[j] = originalknot_vertices[j] - scalingFactor * knot_matrix[i][0];
                knot_vertices[j + 1] = originalknot_vertices[j + 1] - scalingFactor * knot_matrix[i][1];
                knot_vertices[j + 2] = originalknot_vertices[j + 2] - scalingFactor * knot_matrix[i][2];            
            }

            this.knot.geometry.attributes.position.needsUpdate = true;

            if(this.mat_wireframe === false){
                this.knot.geometry.computeFaceNormals();
            }

            this.knot.geometry.computeVertexNormals();
        }

        if(this.geom_value === "Sphere"){

            var sphere_vertices = this.sphere_geometry.attributes.position.array;


            for (var i = 0, j = 0, l = 39999; i < l; i++, j += 3) {
                scalingFactor = this.turing_scaling_factor * normalizedU[i % 199][Math.floor(i / 199)];
                
                sphere_vertices[j] = originalsphere_vertices[j] - scalingFactor * sphere_matrix[i][0];
                sphere_vertices[j + 1] = originalsphere_vertices[j + 1] - scalingFactor * sphere_matrix[i][1];
                sphere_vertices[j + 2] = originalsphere_vertices[j + 2] - scalingFactor * sphere_matrix[i][2];
            
            }

            this.sphere.geometry.attributes.position.needsUpdate = true;
            
            if(this.mat_wireframe === false){
                this.sphere.geometry.computeFaceNormals();
            }
            
            this.sphere.geometry.computeVertexNormals();
        }

    }

    this.ftcs_LE_model = function(){

        // FTCS scheme for solving Lengyel-Epstein model ----
        uv = numeric.div(numeric.mul(u, v), numeric.add(1, numeric.mul(u, u)));
        u_1 = numeric.add(numeric.mul(alpha_u_x, numeric.dot(A, u)), numeric.mul(alpha_u_y, numeric.dot(u, A)));
        v_1 = numeric.add(numeric.mul(alpha_v_x, numeric.dot(A, v)), numeric.mul(alpha_v_y, numeric.dot(v, A)));
        
        unew = numeric.add(u, numeric.add(u_1, numeric.mul(dt, numeric.add(numeric.add(this.a, numeric.mul(-1, u)), numeric.mul(-4, uv)))));
        vnew = numeric.add(v, numeric.mul(sigma, numeric.add(numeric.mul(c, v_1), numeric.mul(dt, numeric.mul(this.b, numeric.add(u, numeric.mul(-1, uv)))))));
        
        u = unew;
        v = vnew;
        // End FTCS scheme for solving Lengyel-Epstein model ----
    }
}