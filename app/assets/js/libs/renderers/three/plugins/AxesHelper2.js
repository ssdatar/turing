// written by Dave Deriso as a Three.js plugin, 2016
// adapted from an original work by Soledad Penades
// http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/

THREE.AxisHelper2 = function ( size ) {

    this.length = size;
    this.mesh = undefined;

    this.buildAxis = function( src, dst, colorHex, dashed ) {
        var geom = new THREE.Geometry(),
            mat; 

        if(dashed) {
            mat = new THREE.LineDashedMaterial({ "linewidth": 3, "color": colorHex, "dashSize": 3, "gapSize": 3 });
        } else {
            mat = new THREE.LineBasicMaterial({ "linewidth": 3, "color": colorHex });
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.Line( geom, mat, THREE.LineSegments );

        return axis;
    }

    this.update = function() {
        var axes = new THREE.Object3D();
        axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( this.length,  0, 0 ), 0xFF0000, false ) ); // +X
        axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3(-this.length,  0, 0 ), 0xFF0000, true) ); // -X
        axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, this.length,  0 ), 0x00FF00, false ) ); // +Y
        axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -this.length, 0 ), 0x00FF00, true ) ); // -Y
        axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, this.length  ), 0x0000FF, false ) ); // +Z
        axes.add( this.buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -this.length ), 0x0000FF, true ) ); // -Z
        this.mesh = axes;
    }

    // this.update();
}