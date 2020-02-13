import './styles/main.scss';
// import {test2, test1} from "./js_components/teste";

import * as THREE from "./libs/three";
// import * as THREE from 'three';
import Stats from "./libs/stats.module";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


// import {GLTFLoader} from 'three-gltf-loader';
// import {GLTFLoader}  from 'three/examples/jsm/loaders/GLTFLoader'
// import * as GLTF from './libs/GLTFLoader';
 import {GLTFLoader} from './libs/GLTFLoader';


/*TESTE*/
// const test = require("js_components/teste");
// document.querySelector('h1').textContent = test2(" to sug113a");
/*TESTE*/



let camera, scene, renderer, splineCamera, cameraHelper;
let parent, tubeGeometry, mesh;



init();
animate();

let container, stats;
let neuron, neuronGlow ;


function init() {
    container = document.getElementById( 'container' );

    // camera
    camera = new THREE.PerspectiveCamera(
        50, window.innerWidth / window.innerHeight,
        0.01, 10000
    );
    camera.position.set( 0, 0, 20 );
    camera.far = 100000;
    camera.updateProjectionMatrix();

    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( "#8f8f8f" );
    // scene.overrideMaterial = new THREE.MeshBasicMaterial( { color: 'green' } );
    let r = "";
    let urls = [ r + "dark-s_px.jpg", r + "dark-s_nx.jpg",
        r + "dark-s_py.jpg", r + "dark-s_ny.jpg",
        r + "dark-s_pz.jpg", r + "dark-s_nz.jpg" ];
    let textureCube = new THREE.CubeTextureLoader().load( urls );
    textureCube.format = THREE.RGBFormat;
    textureCube.encoding = THREE.sRGBEncoding;
    scene.background = textureCube;

    // light
    let light = new THREE.DirectionalLight( "#7ec0ff" , 1);
    light.position.set( -10, 0, 50 );
    scene.add( light );

    light = new THREE.DirectionalLight( "#ffe873" , 1);
    light.position.set( 10, 10, 50 );
    scene.add( light );


//     //sphere
//     let geometry = new THREE.SphereGeometry( 3, 15, 15 );
// // let material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
//     let material = new THREE.MeshLambertMaterial( {color: "#ffff00"} );
//     let sphere = new THREE.Mesh( geometry, material );
//     sphere.position.x = 20;
//     sphere.name = "sphere";
//     scene.add( sphere );



    //LOADER for neuron
    let manager = new THREE.LoadingManager();
    manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
        console.log( 'Started loading file: ' +
            url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };


    // let loader = new GLTFLoader(manager);
    console.log(GLTFLoader)
    let loader = new GLTFLoader();
    loader.load('suganeuron_surface.glb', function ( gltf ) {
    // loader.load('suganeuron3.gltf', function (gltf) {
        console.log("neuron imported::::::");
        console.log(gltf);

        neuron = gltf.scene;
        neuron.name = "neuron";

        let newMaterial = new THREE.MeshLambertMaterial({
            opacity: 0.7, transparent: true,
            color: "#3d52cc",
            side: THREE.DoubleSide,
            // side: THREE.BackSide,
            // emissive: "#3d52cc"
        });

        //changing material
        neuron.traverse((o) => {
            if (o.isMesh) o.material = newMaterial;
        });

        scene.add(neuron);
    });

// CODE FOR GLSL - SHADERS

// <script id="vertexShaderSun" type="x-shader/x-vertex">
//         uniform vec3 viewVector;
//     varying float intensity;
//     void main() {
//         gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
//         vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
//         intensity = pow( dot(normalize(viewVector), actual_normal), 6.0 );
//     }
// </script>
//
//     <script id="fragmentShaderSun" type="x-shader/x-vertex">
//         varying float intensity;
//     void main() {
//         vec3 glow = vec3(0, 1, 0) * intensity;
//         gl_FragColor = vec4( glow, 1.0 );
//     }
// </script>
    let vertexShader = "";
    vertexShader += "uniform vec3 viewVector;";
    vertexShader += "varying float intensity;";
    vertexShader += "void main() {";
    vertexShader += "gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );";
    vertexShader += "vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));";
    vertexShader += "intensity = pow( dot(normalize(viewVector), actual_normal), 6.0 );";
    vertexShader += "}";

    let fragmentShader = "";
    fragmentShader += "varying float intensity;";
    fragmentShader += "void main() {";
    fragmentShader += "vec3 glow = vec3(0, 1, 0) * intensity;";
    fragmentShader += "gl_FragColor = vec4( glow, 1.0 );";
    fragmentShader += "}";

    // LOADER FOR SHYNY NEURON SHADER MATERIAL
    let glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            viewVector: {
                type: "v3",
                value: camera.position
            }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

    loader.load('suganeuron_surface.glb', function ( gltf ) {
        // loader.load('suganeuron3.gltf', function (gltf) {
        console.log("neuronGlow imported::::::");
        console.log(gltf);

        neuronGlow = gltf.scene;
        neuronGlow.name = "neuronGlow";
        // neuronGlow.scale.x = 1.2;
        // neuronGlow.scale.z = 1.2;
        // neuronGlow.scale.y = 1.2;
        for(let i=0; i< neuronGlow.children.length; i++){
            // let glowMesh = new THREE.Mesh(neuronGlow.children[i], glowMaterial);
            neuronGlow.children[i].scale.x = (1.01);
            neuronGlow.children[i].scale.y = (1.01);
            neuronGlow.children[i].scale.z = (1.2);
            // neuronGlow.children[i].glow = glowMesh;
        }

        //changing material
        neuronGlow.traverse((o) => {
            if (o.isMesh) o.material = glowMaterial;
        });

        scene.add(neuronGlow);
    });

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    // stats
    stats = new Stats();
    container.appendChild( stats.dom );

    var controls = new OrbitControls( camera, renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
}

function animate() {
    // if (neuronGlow !== undefined){
    //     for(let i=0; i< neuronGlow.children.length; i++){
    //         let object = neuronGlow.children[i];
    //         let viewVector = new THREE.Vector3().subVectors(
    //             camera.position, object.glow.getWorldPosition()
    //         );
    //         object.glow.material.uniforms.viewVector.value = viewVector;
    //     }
    // }


    requestAnimationFrame( animate );

    render();
    stats.update();

}
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}
function render() {


    // renderer.render( scene, params.animationView === true ? splineCamera : camera );
    renderer.render( scene,  camera );

}
