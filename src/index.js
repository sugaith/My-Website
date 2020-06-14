import './styles/main.scss';
// import {test2, test1} from "./js_components/teste";

import * as THREE from "./libs/three";
// import * as THREE from 'three';
import Stats from "./libs/stats.module";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {FlyControls} from "three/examples/jsm/controls/FlyControls";
import {FirstPersonControls} from "three/examples/jsm/controls/FirstPersonControls";
import {TrackballControls} from "three/examples/jsm/controls/TrackballControls";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";

import {WebGLRenderer} from "./libs/three.module";

// import {TweenMax} from "./libs/TweenMax.min"

import {GLTFLoader} from './libs/GLTFLoader';

import {PATHS} from './js_components/energyPaths'
// import TimelineMax from './libs/TweenMax.min'


const TweenMax = require('./libs/TweenMax.min');
import {TimelineMax, Power2, Elastic, CSSPlugin, Expo} from "gsap" ;

import {EnergySphere} from './classes/EnergySphere'
import {EnergyPumper} from "./classes/EnergyPumper";


/*TESTE*/
// const test = require("js_components/teste");
// document.querySelector('h1').textContent = test2(" to sug113a");
/*TESTE*/


let camera, scene, renderer, splineCamera, cameraHelper;
let parent, tubeGeometry, mesh;
let container, stats;
let neuron, neuronGlow, flyControls, orbitControls, fpsControls;
let clock = new THREE.Clock();
let tempPath = [];
let sphere;
let energyPath_vec3 = [];
let energyPumper1;
let catmullCurve;
let energyPath;
let splineGeometry;
let TICK_PATH = 0;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

init();
animate();


function init() {
  container = document.getElementById('container');

  // camera
  camera = new THREE.PerspectiveCamera(
    50, window.innerWidth / window.innerHeight,
    0.01, 10000
  );
  // camera.position.set( 0, 0, 20 );
  camera.position.set(0, 0, 15);
  camera.lookAt(0, 0, 0);
  camera.far = 100000;
  camera.updateProjectionMatrix();

  // SCENE MAIN
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#8f1510");
  // scene.overrideMaterial = new THREE.MeshBasicMaterial( { color: 'green' } );
  let bg_px = require('../assets/milkyway/dark-s_px.jpg'),
    bg_nx = require('../assets/milkyway/dark-s_nx.jpg'),
    bg_py = require('../assets/milkyway/dark-s_py.jpg'),
    bg_ny = require('../assets/milkyway/dark-s_ny.jpg'),
    bg_pz = require('../assets/milkyway/dark-s_pz.jpg'),
    bg_nz = require('../assets/milkyway/dark-s_nz.jpg');
  console.log("bg_nx");
  console.log(bg_nx);
  // let r = "./";
  // let urls = [ r + "dark-s_px.jpg", r + "dark-s_nx.jpg",
  //     r + "dark-s_py.jpg", r + "dark-s_ny.jpg",
  //     r + "dark-s_pz.jpg", r + "dark-s_nz.jpg" ];
  let urls = [bg_px.default, bg_nx.default, bg_py.default, bg_ny.default, bg_pz.default, bg_nz.default];
  let textureCube = new THREE.CubeTextureLoader().load(urls);
  textureCube.format = THREE.RGBFormat;
  textureCube.encoding = THREE.sRGBEncoding;
  scene.background = textureCube;

  // light
  let light = new THREE.DirectionalLight("#7ec0ff", 1);
  light.position.set(-10, 0, 50);
  scene.add(light);

  light = new THREE.DirectionalLight("#ffe873", 1);
  light.position.set(10, 10, 50);
  scene.add(light);


  //ENERGY PATH
  for (let i = 0; i < PATHS.path1.length; i++) {
    let point = PATHS.path1[i];
    energyPath_vec3.push(new THREE.Vector3(point.x, point.y, point.z))
  }
  catmullCurve = new THREE.CatmullRomCurve3(energyPath_vec3);
  var points;
  points = catmullCurve.getPoints(50);

  let splineMaterial = new THREE.LineBasicMaterial({color: "#ffa9ac"});
  splineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  energyPath = new THREE.Line(splineGeometry, splineMaterial);
  scene.add(energyPath);

  //sphere
  energyPumper1 = new EnergyPumper(catmullCurve, scene);
  // scene.add( energySphere.sphere );


  //LOADER for neuron
  let manager = new THREE.LoadingManager();
  manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' +
      url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };


  // let loader = new GLTFLoader(manager);
  console.log(GLTFLoader);
  let loader = new GLTFLoader();

  let neuronURL = require('../assets/suganeuron_surface.glb');
  // loader.load('suganeuron_surface.glb', function ( gltf ) {
  loader.load(neuronURL.default, function (gltf) {
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

    // renderTheRest();
  });

// CODE FOR GLSL - SHADERS

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

  // loader.load('./suganeuron_surface.glb', function ( gltf ) {
  loader.load(neuronURL.default, function (gltf) {
    console.log("neuronGlow imported::::::");
    console.log(gltf);

    neuronGlow = gltf.scene;
    neuronGlow.name = "neuronGlow";
    // neuronGlow.scale.x = 1.2;
    // neuronGlow.scale.z = 1.2;
    // neuronGlow.scale.y = 1.2;
    for (let i = 0; i < neuronGlow.children.length; i++) {
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

    // scene.add(neuronGlow);
  });

  // renderer
  renderer = new WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);

  //FLY / ORBIT CONTROLS
  // orbitControls = new OrbitControls( camera, renderer.domElement );

  // FLY CONTROL
  flyControls = new FlyControls(camera, renderer.domElement);
  flyControls.movementSpeed = 5;
  flyControls.rollSpeed = Math.PI / 6;
  // flyControls.autoForward = true;
  flyControls.dragToLook = false;

  //FPS CONTROL
  // fpsControls = new PointerLockControls( camera ,  document.body );
  // // scene.add(fpsControls.getObject());
  // document.body.addEventListener( 'click', function () {
  //     fpsControls.lock();
  // }, false );


  // EVENT LISTENERS
  // document.addEventListener( 'keydown', onKeyDown, false );
  // document.addEventListener( 'keyup', onKeyUp, false );
  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('click', onMouseClick, false);
  document.addEventListener('keypress', keypress);
  TweenMax.ticker.addEventListener('tick', updatePaths);

  energyPumper1.pump();
}

let TICK_DELAY = .1;//seconds
let clockPath = new THREE.Clock();
clockPath.start();

function updatePaths() {


  //
  // let elipsedTime = clock.getElapsedTime();
  // // console.log("tick updatePaths");
  // // console.log(elipsedTime);
  // // console.log(clock.getDelta());
  // // let limit = energyPath_vec3.length;
  // let points = catmullCurve.getPoints(100);
  // let limit = points.length;
  //
  //
  //
  // if (TICK_PATH < limit){
  //     if (elipsedTime > TICK_DELAY){
  //         let newPos = points[TICK_PATH];
  //
  //         new TimelineMax()
  //         .to( energySphere.sphere.position, 1, {
  //             x:  newPos.x,
  //             y:  newPos.y,
  //             z:  newPos.z,
  //             // ease: Linear
  //         });
  //
  //         // sphere.position.x = newPos.x;
  //         // sphere.position.y = newPos.y;
  //         // sphere.position.z = newPos.z;
  //
  //         TICK_PATH++;
  //         clock.start();
  //     }
  // }else{
  //     TICK_PATH = 0;
  // }
}


let acceleration = 30.0;

function animate() {
  let delta = clock.getDelta();
  flyControls.update(delta);
  // fpsControls.update(delta);

  // if (neuronGlow !== undefined){
  //     for(let i=0; i< neuronGlow.children.length; i++){
  //         let object = neuronGlow.children[i];
  //         let viewVector = new THREE.Vector3().subVectors(
  //             camera.position, object.glow.getWorldPosition()
  //         );
  //         object.glow.material.uniforms.viewVector.value = viewVector;
  //     }
  // }


  requestAnimationFrame(animate);

  // if ( fpsControls.isLocked === true ) {
  //     //for up and down
  //     let cameraLookAtVector = new THREE.Vector3( 0, 0, - 1 );
  //     cameraLookAtVector.applyQuaternion( camera.quaternion );
  //
  //     var time = performance.now();
  //     var delta = ( time - prevTime ) / 1000;
  //
  //     velocity.x -= velocity.x * 10.0 * delta;
  //     velocity.z -= velocity.z * 10.0 * delta;
  //     // velocity.y -= velocity.y * 10.0 * delta;
  //
  //     // velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
  //
  //     direction.z = Number( moveForward ) - Number( moveBackward );
  //     direction.x = Number( moveRight ) - Number( moveLeft );
  //     direction.normalize(); // this ensures consistent movements in all directions
  //
  //     if ( moveForward || moveBackward ) {
  //         //to move fwrd OR bkrd
  //         // velocity.z -= direction.z * acceleration * delta;
  //
  //         //new -> deaaccelerate according to cameraLookAtVector.y
  //         let absLookY_neg = 1 - Math.abs( cameraLookAtVector.y );
  //         velocity.z -= direction.z * (acceleration * absLookY_neg) * delta;
  //
  //         //to move up or down
  //         let absLookY_pos = Math.abs( cameraLookAtVector.y );
  //         if (Math.abs(cameraLookAtVector.y) > 0.1){
  //             if (moveForward)
  //                 velocity.y += cameraLookAtVector.y * (acceleration * absLookY_pos) * delta;
  //             if (moveBackward)
  //                 velocity.y -= cameraLookAtVector.y * (acceleration * absLookY_pos) * delta;
  //         }
  //     }else{
  //         velocity.y = 0;
  //     }
  //
  //
  //     if ( moveLeft || moveRight ) velocity.x -= direction.x * acceleration * delta;
  //
  //     // if ( onObject === true ) {
  //     //
  //     //     velocity.y = Math.max( 0, velocity.y );
  //     //     canJump = true;
  //     //
  //     // }
  //
  //     fpsControls.moveRight( - velocity.x * delta );
  //     fpsControls.moveForward( - velocity.z * delta );
  //
  //     fpsControls.getObject().position.y += ( velocity.y * delta ); // new behavior
  //
  //     // if ( fpsControls.getObject().position.y < 10 ) {
  //     //     velocity.y = 0;
  //     //     fpsControls.getObject().position.y = 10;
  //     //
  //     //     // canJump = true;
  //     // }
  //
  //     prevTime = time;
  //
  // }

  render();
  stats.update();

}

function onKeyDown(event) {
  switch (event.keyCode) {

    case 38: // up
    case 87: // w
      moveForward = true;
      break;
    case 37: // left
    case 65: // a
      moveLeft = true;
      break;
    case 40: // down
    case 83: // s
      moveBackward = true;
      break;
    case 39: // right
    case 68: // d
      moveRight = true;
      break;
  }
}

function onKeyUp(event) {
  switch (event.keyCode) {
    case 38: // up
    case 87: // w
      moveForward = false;
      break;
    case 37: // left
    case 65: // a
      moveLeft = false;
      break;
    case 40: // down
    case 83: // s
      moveBackward = false;
      break;
    case 39: // right
    case 68: // d
      moveRight = false;
      break;
  }
}

function keypress() {
  // console.log(camera.position);
  tempPath.push(new THREE.Vector3(
    camera.position.x,
    camera.position.y,
    camera.position.z,
  ));
}


function onMouseClick(event) {
  // event.preventDefault();
  console.log(camera);
  console.log(camera.position);
  console.log(JSON.stringify(tempPath));

  console.log(" looking vector ");
  let vector = new THREE.Vector3(0, 0, -1);
  vector.applyQuaternion(camera.quaternion);
  console.log(vector);
  console.log(PATHS);
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function render() {


  // renderer.render( scene, params.animationView === true ? splineCamera : camera );
  renderer.render(scene, camera);

}


function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/jpg");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}
