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

    // light
    var light = new THREE.DirectionalLight( "#ffffff" );
    light.position.set( 0, 0, 1 );
    scene.add( light );


//     //sphere
//     let geometry = new THREE.SphereGeometry( 3, 15, 15 );
// // let material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
//     let material = new THREE.MeshLambertMaterial( {color: "#ffff00"} );
//     let sphere = new THREE.Mesh( geometry, material );
//     sphere.position.x = 20;
//     sphere.name = "sphere";
//     scene.add( sphere );



    //LOADER
    let manager = new THREE.LoadingManager();
    manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
        console.log( 'Started loading file: ' +
            url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
    };


    // let loader = new GLTFLoader(manager);
    console.log(GLTFLoader)
    let loader = new GLTFLoader();
    let neuron ;
    loader.load('suganeuron3.glb', function ( gltf ) {
    // loader.load('suganeuron3.gltf', function (gltf) {
        console.log("neuron imported::::::");
        console.log(gltf);

        neuron = gltf.scene;
        neuron.name = "neuron";

        let newMaterial = new THREE.MeshLambertMaterial({
            opacity: 0.9, transparent: true,
            color: "#3d52cc",
            // side: THREE.DoubleSide,
            side: THREE.BackSide,
        });

        neuron.traverse((o) => {
            if (o.isMesh) o.material = newMaterial;
        });

        scene.add(neuron);
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
