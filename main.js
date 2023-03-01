import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap } from 'gsap'
import { SpriteFlipbook } from '/src/SpriteFlipbook.js'
import { VideoPlayer } from './src/VideoPlayer.js'
import { AddInteractiveItem } from './src/AddInteractiveItem.js'


/**
 * INIT
 * 
 */

// Scene

const scene = new THREE.Scene();
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
const canvas = document.querySelector('canvas.app360');
const buttonDiv = document.querySelector('.button');

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

const loadingBarElement = document.querySelector('.loading-bar');
let sceneReady = false;

const videoPlayer = new VideoPlayer(scene);
const items_ = new AddInteractiveItem(scene, videoPlayer);

const loadingManager = new THREE.LoadingManager(
  //loaded
  () => {
    gsap.delayedCall(0.5, () => {
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
      loadingBarElement.classList.add('ended');
      loadingBarElement.style.transform = '';
    });
    window.setTimeout(() => {
      sceneReady = true; buttonDiv.classList.add('showB');
      overlay.geometry.dispose();
      overlay.material.dispose();
      scene.remove(overlay);
  }, 1000);
    moveCamFromMap(-1);
    window.setTimeout(()=>{
      items_.initDraw();
    }, 1000);
  },
  //progress
  (itemURL, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal;
    loadingBarElement.style.transform = `scaleX(${progressRatio})`;
  },
  //error
  () => {
    console.log(urlError);
  }
);

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(sizes.width, sizes.height)
camera.position.z = 1;
scene.add(camera);

// Sizes
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const overlayMaterial = new THREE.ShaderMaterial({
  transparent: true,
  uniforms: {
    uAlpha: { value: 1 }
  },
  vertexShader: `
      void main(){
          gl_Position = vec4(position, 1.0);
      }
  `,
  fragmentShader: `
      uniform float uAlpha;
      void main(){
          gl_FragColor = vec4(0, 0, 0, uAlpha);
      }
  `
});
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay);

const dracoLoader = new DRACOLoader(loadingManager);
dracoLoader.setDecoderPath('/draco/');
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.setDRACOLoader(dracoLoader);

const textureLoader = new THREE.TextureLoader(loadingManager);
const tex_atlas = textureLoader.load('./textures/atlas_low.jpg');
const tex_img01 = textureLoader.load('./textures/img01.jpg');
const tex_img02 = textureLoader.load('./textures/img02.jpg');
const tex_img03 = textureLoader.load('./textures/img03.jpg');
const tex_img04 = textureLoader.load('./textures/img04.jpg');
const tex_img05 = textureLoader.load('./textures/img05.jpg');
const tex_img06 = textureLoader.load('./textures/img06.jpg');

const tex_img = textureLoader.load('./textures/img.jpg');
const mat_img = new THREE.MeshBasicMaterial({map: tex_img});

const mat_img01 = new THREE.MeshBasicMaterial({map: tex_img01});
const mat_img02 = new THREE.MeshBasicMaterial({map: tex_img02});
const mat_img03 = new THREE.MeshBasicMaterial({map: tex_img03});
const mat_img04 = new THREE.MeshBasicMaterial({map: tex_img04});
const mat_img05 = new THREE.MeshBasicMaterial({map: tex_img05});
const mat_img06 = new THREE.MeshBasicMaterial({map: tex_img06});


const clicks = [];
const balls = [];

let moveingMap = false;
let office3D;

const robotList = [];

const robot_pulse = new SpriteFlipbook('./textures/pulse.png', 0xff0000, 5,5, scene);
robot_pulse.setPosition(-5, -1.2, -4.5);
robot_pulse.setScale(1.5,1.5,1.5);
robot_pulse.loop([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,20], 1.3);

// ----------------------------------------------------------------



const image_pulse = new SpriteFlipbook('./textures/pulse.png', 0xff0000, 5,5, scene);
image_pulse.setPosition(-31, -0.1, 0.5);
image_pulse.setScale(1.5,1.5,1.5);
image_pulse.loop([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,20], 1.3);


// ----------------------------------------------------------------


const video_pulse = new SpriteFlipbook('./textures/pulse.png', 0xff0000, 5,5, scene);
video_pulse.setPosition(-49.85,0,-35);
video_pulse.setScale(1.5,1.5,1.5);
video_pulse.loop([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,20], 1.3);


// ----------------------------------------------------------------

draw360();
drawClicks();

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enablePan = false;
controls.minDistance = 0.1;
controls.maxDistance = 7;
controls.zoomSpeed = 3;
controls.rotateSpeed = -0.4;

controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: '',
  RIGHT: THREE.MOUSE.PAN
}

let drawMapOnce = true;
const clock = new THREE.Clock();
let deltaTime;
const tick = () => {
  controls.update();
  deltaTime = clock.getDelta();

  robot_pulse.update(deltaTime);
  image_pulse.update(deltaTime);
  video_pulse.update(deltaTime);

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}
tick();

function drawClicks() {
  gltfLoader.load('./models/click.glb', (gltf) => {
    gltf.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if(obj.name == 'arrows'){
          obj.material = mat_img;
          clicks.push(obj);
        }else{
          obj.material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
          obj.visible = false;
          clicks.push(obj);
        }
      }
    });
    gltf.scene.position.y -= 0.6;
    scene.add(gltf.scene);
  });
}

let emitMesh;
function draw360() {
  gltfLoader.load('./models/office.glb', (gltf) => {
    gltf.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        switch (obj.name) {
          case 'office':
            obj.material = new THREE.MeshBasicMaterial({ map: tex_atlas });
            office3D = obj;
            break;
          case 'img01':
            obj.material = mat_img01;
            break;
          case 'img02':
            obj.material = mat_img02;
            break;
          case 'img03':
            obj.material = mat_img03;
            break;
          case 'img04':
            obj.material = mat_img04;
            break;
          case 'img05':
            obj.material = mat_img05;
            break;
          case 'img06':
            obj.material = mat_img06;
            obj.rotation.y = Math.PI / -0.415;
            break;
          case 'emit':
            emitMesh = obj;
            obj.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            break;
          case 'outside':
            obj.material = mat_img01;
            break;
        }
        balls.push(obj);
      }
    });
    scene.add(gltf.scene);
    emitMesh.visible = false;
  });
}

const rayCast = new THREE.Raycaster();

const mouseDown = new THREE.Vector2();
const mouseup = new THREE.Vector2();
window.addEventListener('pointerdown', (event) => {
  mouseDown.x = event.clientX / sizes.width * 2 - 1;
  mouseDown.y = -1 * (event.clientY / sizes.height * 2 - 1);
});

var interactiveObjIsOn = false;
var cameraIsInIndex1 = false;

window.addEventListener('pointerup', (event) => {
  mouseup.x = event.clientX / sizes.width * 2 - 1;
  mouseup.y = -1 * (event.clientY / sizes.height * 2 - 1);

  const dragCheck = mouseDown.distanceTo(mouseup);
  if (dragCheck <= 0.07) {
    rayCast.setFromCamera(mouseup, camera);
    if (mapToggle == 0) {
      const intersects = rayCast.intersectObjects(clicks);
      if (intersects.length != 0) {
        if(interactiveObjIsOn){
          if(isRobotOn){ toggleRobot(); }
          if(isImageOn){ toggleImage(); }
          if(isVideoOn){ toggleVideo(); }
        }
        switch (intersects[0].object.name) {
          case '2t1':
            moveCamTo(2, 1);
            cameraIsInIndex1 = true;
            break;
          case '3t1':
            moveCamTo(3, 1);
            cameraIsInIndex1 = true;
            break;
          case '1t2':
            moveCamTo(1, 2);
            cameraIsInIndex1 = false;
            break;
          case '1t3':
            moveCamTo(1, 3);
            cameraIsInIndex1 = false;
            break;
          case '4t3':
            moveCamTo(4, 3);
            break;
          case '5t3':
            moveCamTo(5, 3);
            break;
          case '3t4':
            moveCamTo(3, 4);
            break;
          case '3t5':
            moveCamTo(3, 5);
            break;
          case '6t1':
            moveCamTo(6, 1);
            cameraIsInIndex1 = true;
            break;
          case '1t6':
            moveCamTo(1, 6);
            cameraIsInIndex1 = false;
            break;
        }
      } else {
        const intersect_triggers = rayCast.intersectObjects(items_.returnTriggers());
        if (intersect_triggers.length != 0) {
          switch (intersect_triggers[0].object.name) {
            case 'robot_t':
              toggleRobot();
              break;
            case 'image_t':
              toggleImage();
              break;
            case 'video_t':
              toggleVideo();
              break;
          }
        }
      }
    } else {
      const intersects = rayCast.intersectObjects(balls);
      if (intersects.length != 0) {
        switch (intersects[0].object.name) {
          case 'img01':
            moveCamFromMap(1);
            break;
          case 'img02':
            moveCamFromMap(2);
            break;
          case 'img03':
            moveCamFromMap(3);
            break;
          case 'img04':
            moveCamFromMap(4);
            break;
          case 'img05':
            moveCamFromMap(5);
            break;
          case 'img06':
            moveCamFromMap(6);
            break;
        }
      }
    }

  } else {
    // is a drag
  }
});

const boxArray = [
  { "x": 0, "y": 0, "z": 0 },
  { "x": -3, "y": 0, "z": -30 },
  { "x": -31, "y": 0, "z": -6 },
  { "x": -56, "y": 0, "z": -35 },
  { "x": -53, "y": 0, "z": -3 },
  { "x": 30, "y": 0, "z": 0 }
];
const cameraPos = new THREE.Vector3(0, 0, 0);

function moveCamTo(from, index) {

  from--;
  index--;
  controls.enabled = false;
  cameraPos.copy(camera.position);

  cameraPos.x -= boxArray[from].x;
  cameraPos.y -= boxArray[from].y;
  cameraPos.z -= boxArray[from].z;

  cameraPos.x += boxArray[index].x;
  cameraPos.y += boxArray[index].y;
  cameraPos.z += boxArray[index].z;

  window.setTimeout(() => { controls.enabled = true; }, 850);
  gsap.to(camera.position, { duration: 0.6, x: cameraPos.x, y: cameraPos.y, z: cameraPos.z });
  gsap.to(controls.target, { duration: 0.6, x: boxArray[index].x, y: boxArray[index].y, z: boxArray[index].z });
}

let mapToggle = 0;
const mapCenter = new THREE.Vector3(-31, 0, -16);
const camLastPos = new THREE.Vector3();
const targetLastPos = new THREE.Vector3();

document.getElementById("mapButton").onclick = function clickBoutton() {
  if (!moveingMap) {
    if (isRobotOn) { toggleRobot(); }
    if (isImageOn) { toggleImage(); }
    disableMap();
    moveCamFromMap(-1);
  }
}

function moveCamFromMap(index) {
  if (index == -1) {
    if (mapToggle == 0) {
      camLastPos.copy(camera.position);
      targetLastPos.copy(controls.target);
      emitMesh.visible = true;
      mapToggle = 1;
      window.setTimeout(() => { controls.minDistance = 80; }, 600);
      controls.maxDistance = 300;
      controls.rotateSpeed = 0.4;
      gsap.to(controls.target, { duration: 1, x: mapCenter.x, y: mapCenter.y, z: mapCenter.z });
      gsap.to(camera.position, { duration: 1, x: mapCenter.x, y: mapCenter.y + 30, z: mapCenter.z + 100 });
    } else {
      controls.minDistance = 0.1;
      window.setTimeout(() => { emitMesh.visible = false; controls.maxDistance = 7; }, 1100);
      mapToggle = 0;
      controls.rotateSpeed = -0.4;
      gsap.to(controls.target, { duration: 0.6, x: targetLastPos.x, y: targetLastPos.y, z: targetLastPos.z });
      gsap.to(camera.position, { duration: 0.7, delay: 0.6, x: camLastPos.x, y: camLastPos.y, z: camLastPos.z });
    }
  } else {
    let rotationFactor = new THREE.Vector3(0, 0, 0);
    if (camera.position.z > 0) {
      rotationFactor.z = 1;
    } else { rotationFactor.z = -1; }
    if (camera.position.x > 0) {
      rotationFactor.x = 1;
    } else { rotationFactor.x = -1; }

    index--;

    if (index == 0) { cameraIsInIndex1 = true; } else { cameraIsInIndex1 = false; }

    controls.minDistance = 0.1;
    window.setTimeout(() => {
      emitMesh.visible = false;
      controls.maxDistance = 7;
    }, 1100);
    mapToggle = 0;
    controls.rotateSpeed = -0.4;
    gsap.to(controls.target, { duration: 0.6, x: boxArray[index].x, y: boxArray[index].y, z: boxArray[index].z });
    gsap.to(camera.position, { duration: 0.7, delay: 0.6, x: boxArray[index].x + rotationFactor.x, y: boxArray[index].y, z: boxArray[index].z + rotationFactor.z });
  }
}

function disableMap() {
  if (!moveingMap) {
    moveingMap = true;
    window.setTimeout(() => { moveingMap = false; }, 2000);
  }
}

let isRobotOn = false;
function toggleRobot() {
  if (!isRobotOn) {
    interactiveObjIsOn = true;
    items_.returnItem(1).visible = true;
    items_.returnItem(2).visible = true;
    isRobotOn = true;
    controls.rotateSpeed = 0.4;
    controls.minDistance = 1.0;
  } else {
    interactiveObjIsOn = false;
    items_.returnItem(1).visible = false;
    items_.returnItem(2).visible = false;
    isRobotOn = false;
    controls.rotateSpeed = -0.4;
    controls.minDistance = 0.1;
  }
}

let isImageOn = false;
function toggleImage() {
  if (!isImageOn) {
    interactiveObjIsOn = true;
    items_.returnItem(0).visible = true;
    isImageOn = true;
  } else {
    interactiveObjIsOn = false;
    items_.returnItem(0).visible = false;
    isImageOn = false;
  }
}

let isVideoOn = false;
function toggleVideo(){
  if(isVideoOn){
    isVideoOn = false;
    videoPlayer.stopVideo();
  }else{
    isVideoOn = true;
    videoPlayer.playVideo();
  }
}