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
    this.a = 7;
    this.b = 1.5;
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

    var sphere_matrix = [],
        normalMatrix3 = [],
        donut_matrix = [],
        normalMatrix5 = [],
        knot_matrix = [];
    var originalVertices = [],
        originaldonut_vertices = [],
        originalVertices3 = [];

    // End Turing Pattern Parameters ---------------------------      


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


    this.create_turing_pattern = function() {
        //main geometry

        // put in a create material method
        this.material = new THREE.MeshNormalMaterial({
            color: 0xffffff,
            emissive: 0x111111,
            shading: THREE.SmoothShading,
            side: THREE.DoubleSide,
            wireframe: this.mat_wireframe,
            wireframeLinewidth: .001
        });
        this.material.transparent = true;
        this.material.opacity = this.opacity;

        // put in a create donut method
        this.donut_geometry = new THREE.TorusBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);
        this.donut_geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.donut_geometry.computeFaceNormals();
        this.donut_geometry.computeVertexNormals();
        this.donut = new THREE.Mesh(this.donut_geometry, this.material);
        this.donut.position.set(0, 0, 0);

        this.geometry = new THREE.SphereBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);
        this.geometry2 = new THREE.SphereBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);
        this.geom3 = new THREE.SphereBufferGeometry(this.radius, this.thickness / 1.01, this.mesh_detail, this.mesh_detail);        
        this.geom5 = new THREE.TorusBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);
        this.geom6 = new THREE.TorusBufferGeometry(this.radius, this.thickness / 1.01, this.mesh_detail, this.mesh_detail);
        this.geom7 = new THREE.TorusKnotBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);
        this.geom8 = new THREE.TorusKnotBufferGeometry(this.radius, this.thickness, this.mesh_detail, this.mesh_detail);
        this.geom9 = new THREE.TorusKnotBufferGeometry(this.radius, this.thickness / 1.01, this.mesh_detail, this.mesh_detail);
        this.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.geometry.computeFaceNormals();
        this.geometry.computeVertexNormals();
        this.geom7.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.geom7.computeFaceNormals();
        this.geom7.computeVertexNormals();
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(0, 0, 0);
        this.mesh7 = new THREE.Mesh(this.geom7, this.material);
        this.mesh7.position.set(0, 0, 0);

        //create matrix of normal vectors for the original surface
        this.edges = new THREE.VertexNormalsHelper(this.mesh, 1, 0x00ff00, 1);
        normalMatrix = this.edges.geometry.attributes.position.array;
        for (var i = 0, j = 0, l = 39999; i < l; i++, j += 6) {
            sphere_matrix.push([normalMatrix[j] - normalMatrix[j + 3], normalMatrix[j + 1] - normalMatrix[j + 4], normalMatrix[j + 2] - normalMatrix[j + 5]]);
        }


        this.edges2 = new THREE.VertexNormalsHelper(this.donut, 1, 0x00ff00, 1);
        normalMatrix3 = this.edges2.geometry.attributes.position.array;
        for (var i = 0, j = 0, l = 39999; i < l; i++, j += 6) {
            donut_matrix.push([normalMatrix3[j] - normalMatrix3[j + 3], normalMatrix3[j + 1] - normalMatrix3[j + 4], normalMatrix3[j + 2] - normalMatrix3[j + 5]]);
        }

        this.edges3 = new THREE.VertexNormalsHelper(this.mesh7, 1, 0x00ff00, 1);
        normalMatrix5 = this.edges3.geometry.attributes.position.array;
        for (var i = 0, j = 0, l = 39999; i < l; i++, j += 6) {
            knot_matrix.push([normalMatrix5[j] - normalMatrix5[j + 3], normalMatrix5[j + 1] - normalMatrix5[j + 4], normalMatrix5[j + 2] - normalMatrix5[j + 5]]);
        }

        //geometry used as reference for original points
        // this.geometry2 = new THREE.SphereBufferGeometry(this.radius,this.thickness, this.mesh_detail, this.mesh_detail);
        this.geometry2.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        originalVertices = this.geometry2.attributes.position.array;

        this.geom5.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        originaldonut_vertices = this.geom5.attributes.position.array;

        this.geom8.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        originalVertices3 = this.geom8.attributes.position.array;
        //console.log(originaldonut_vertices.length);

        //geometry for inner light
        // this.geom3 = new THREE.SphereBufferGeometry(this.radius,this.thickness/1.01, this.mesh_detail, this.mesh_detail);
        this.geom3.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.geom6.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        this.geom9.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

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



        this.mesh9 = new THREE.Mesh(this.geom9, this.material3);
        this.mesh9.position.set(0, 0, 0);

    }
    this.update_turing = function() {


        // this should be in a separate method

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
        temp = numeric.sub(v, math.min(v));
        temp = numeric.div(temp, math.max(temp));


        var donut_vertices = this.donut_geometry.attributes.position.array;
        for (var i = 0, j = 0, l = 39999; i < l; i++, j += 3) {
            scalingFactor = this.turing_scaling_factor * temp[i % 199][Math.floor(i / 199)];
            if (this.geom_value === "Donut") {
                donut_vertices[j] = originaldonut_vertices[j] - scalingFactor * donut_matrix[i][0];
                donut_vertices[j + 1] = originaldonut_vertices[j + 1] - scalingFactor * donut_matrix[i][1];
                donut_vertices[j + 2] = originaldonut_vertices[j + 2] - scalingFactor * donut_matrix[i][2];
            }

            if (this.geom_value === "Knot") {
                vertices3[j] = originalVertices3[j] - scalingFactor * knot_matrix[i][0];
                vertices3[j + 1] = originalVertices3[j + 1] - scalingFactor * knot_matrix[i][1];
                vertices3[j + 2] = originalVertices3[j + 2] - scalingFactor * knot_matrix[i][2];
            }

            if (this.geom_value === "Sphere") {
                vertices[j] = originalVertices[j] - scalingFactor * sphere_matrix[i][0];
                vertices[j + 1] = originalVertices[j + 1] - scalingFactor * sphere_matrix[i][1];
                vertices[j + 2] = originalVertices[j + 2] - scalingFactor * sphere_matrix[i][2];
            }
        }

        this.donut.geometry.attributes.position.needsUpdate = true;
        // this.donut.geometry.computeFaceNormals(); // you don't need this for wireframes
        this.donut.geometry.computeVertexNormals();

    }
}