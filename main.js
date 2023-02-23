import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap } from 'gsap'
import { SpriteFlipbook } from '/src/SpriteFlipbook.js'
import { VideoPlayer } from './src/VideoPlayer.js';

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
const canvas = document.querySelector('canvas.app360');
const buttonDiv = document.querySelector('.button');

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

const loadingBarElement = document.querySelector('.loading-bar');
let sceneReady = false;

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
//const tex_map = textureLoader.load('./textures/map.jpg');
const tex_img01 = textureLoader.load('./textures/img01.jpg');
const tex_img02 = textureLoader.load('./textures/img02.jpg');
const tex_img03 = textureLoader.load('./textures/img03.jpg');
const tex_img04 = textureLoader.load('./textures/img04.jpg');
const tex_img05 = textureLoader.load('./textures/img05.jpg');
const tex_img06 = textureLoader.load('./textures/img06.jpg');
// const tex_matcap = textureLoader.load('./textures/matcap.jpg');

const clicks = [];
const balls = [];
const triggers = [];

let moveingMap = false;
let office3D;

// const googleMap = new THREE.Mesh(
//   new THREE.PlaneGeometry(1400, 1400, 10, 10),
//   new THREE.MeshBasicMaterial({map: tex_map})
// );
// googleMap.position.set(-20,-20,-50);

// googleMap.rotation.x = Math.PI * -0.5;
// googleMap.rotation.z = Math.PI * -0.05;

// scene.add(googleMap);


const tex_arm = textureLoader.load('./textures/arm_color.jpg');
tex_arm.flipY = false;
const tex_base = textureLoader.load('./textures/base_color2.jpg');
tex_base.flipY = false;

// tex_blink.repeat = THREE.RepeatWrapping;
// tex_blink.offset.y = -0.5;

const robotList = [];

gltfLoader.load('./models/robotArm.glb', (gltf) => {
  gltf.scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      if (obj.name == 'robotArm') {
        obj.material = new THREE.MeshBasicMaterial({ map: tex_arm });
        obj.position.y -= 0.5;
        obj.visible = false;
        robotList.push(obj);
      } else {
        obj.material = new THREE.MeshBasicMaterial({ map: tex_base });
        obj.position.y -= 0.5;
        obj.visible = false;
        robotList.push(obj);
      }
    }
  });
  scene.add(gltf.scene);
});

const robot_trigger = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 1, 0.6),
  new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
);
triggers.push(robot_trigger);
robot_trigger.visible = false;
robot_trigger.position.set(-5.4, -1.35, -4.8);
robot_trigger.name = 'robot_t';
scene.add(robot_trigger);

const robot_pulse = new SpriteFlipbook('./textures/pulse.png', 0xff0000, 5,5, scene);
robot_pulse.setPosition(-5, -1.2, -4.5);
robot_pulse.setScale(1.5,1.5,1.5);
robot_pulse.loop([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,20], 1.3);

// ----------------------------------------------------------------

const image_trigger = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 0.5),
  new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
);
triggers.push(image_trigger);
image_trigger.visible = false;
image_trigger.position.set(-31, -0.1, 1.5);
image_trigger.name = 'image_t';
scene.add(image_trigger);

const image_pulse = new SpriteFlipbook('./textures/pulse.png', 0xff0000, 5,5, scene);
image_pulse.setPosition(-31, -0.1, 1.1);
image_pulse.setScale(1.5,1.5,1.5);
image_pulse.loop([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,20], 1.3);

const tex_map = textureLoader.load('./textures/map.jpg');
tex_map.flipY = false;
const imagePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(6,6),
  new THREE.MeshBasicMaterial({map: tex_map, side: THREE.DoubleSide})
);
imagePlane.name = 'image_t';
triggers.push(imagePlane);
imagePlane.rotation.z = Math.PI;
imagePlane.position.set(-31, -0.1, -2);
imagePlane.visible = false;
scene.add(imagePlane);
// ----------------------------------------------------------------


const robotRaycastBlock = new THREE.Mesh(
  new THREE.SphereGeometry(2, 12, 12),
  new THREE.MeshBasicMaterial({ side: THREE.BackSide })
);
robotRaycastBlock.scale.set(0, 0, 0);
robotRaycastBlock.visible = false;
scene.add(robotRaycastBlock);

const videoPlayer1 = new VideoPlayer(scene);
videoPlayer1.createVideo();
videoPlayer1.stopVideo();
const videoBox = new THREE.Mesh(
  new THREE.BoxGeometry(8,4.5,0.3,2,2,2),
  new THREE.MeshBasicMaterial({color: 0xff00ff, wireframe: true})
);
videoBox.position.set(-50.4,0,-35);
videoBox.rotation.y = -Math.PI / 2;
videoBox.visible = false;
videoBox.name = 'video_t';
triggers.push(videoBox);
scene.add(videoBox);

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
        obj.material = new THREE.MeshBasicMaterial({ map: tex_atlas });
        clicks.push(obj);
      }
    });
    scene.add(gltf.scene);
  });
}

let emitMesh;
function draw360() {
  gltfLoader.load('./models/office2.glb', (gltf) => {
    gltf.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        switch (obj.name) {
          case 'office':
            obj.material = new THREE.MeshBasicMaterial({ map: tex_atlas });
            office3D = obj;
            break;
          case 'img01':
            obj.material = new THREE.MeshBasicMaterial({ map: tex_img01 });
            break;
          case 'img02':
            obj.material = new THREE.MeshBasicMaterial({ map: tex_img02 });
            break;
          case 'img03':
            obj.material = new THREE.MeshBasicMaterial({ map: tex_img03 });
            break;
          case 'img04':
            obj.material = new THREE.MeshBasicMaterial({ map: tex_img04 });
            break;
          case 'img05':
            obj.material = new THREE.MeshBasicMaterial({ map: tex_img05 });
            break;
          case 'img06':
            obj.material = new THREE.MeshBasicMaterial({ map: tex_img06 });
            obj.rotation.y = Math.PI / -0.415;
            break;
          case 'emit':
            emitMesh = obj;
            obj.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            break;
          case 'outside':
            obj.material = new THREE.MeshBasicMaterial({ map: tex_img01 });
            break;
        }
        balls.push(obj);
      }
    });
    scene.add(gltf.scene);
    emitMesh.visible = false;
    // office3D.visible = false;
  });
}

const rayCast = new THREE.Raycaster();

// const mouse = new THREE.Vector2();
// window.addEventListener('pointermove', (event) => {
//   mouse.x = event.clientX / sizes.width * 2 - 1;
//   mouse.y = -1 * (event.clientY / sizes.height * 2 - 1);
// });

const mouseDown = new THREE.Vector2();
const mouseup = new THREE.Vector2();
window.addEventListener('pointerdown', (event) => {
  mouseDown.x = event.clientX / sizes.width * 2 - 1;
  mouseDown.y = -1 * (event.clientY / sizes.height * 2 - 1);
  // mouseDown.copy(mouse);
  // const intersects = rayCast.intersectObjects(balls);
  // console.log('x: ' + intersects[0].point.x.toFixed(3) + ' y: ' + intersects[0].point.y.toFixed(3) + ' z: ' + intersects[0].point.z.toFixed(3));
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
      if (intersects.length != 0 && !interactiveObjIsOn) {
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
        const intersect_triggers = rayCast.intersectObjects(triggers);
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
      // office3D.visible = true;
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
      // disableMap();
      controls.minDistance = 0.1;
      window.setTimeout(() => { emitMesh.visible = false; controls.maxDistance = 7; }, 1100);
      mapToggle = 0;
      controls.rotateSpeed = -0.4;
      gsap.to(controls.target, { duration: 0.6, x: targetLastPos.x, y: targetLastPos.y, z: targetLastPos.z });
      gsap.to(camera.position, { duration: 0.7, delay: 0.6, x: camLastPos.x, y: camLastPos.y, z: camLastPos.z });
      // office3D.visible = false;
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
      // office3D.visible = false;
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
    // const mapB = document.querySelector('.button');
    // mapB.disable = true;
    // console.log(mapB);
    // window.setTimeout(() => { mapB.disable = false; moveingMap = false;}, 2000);
  }
}

let isRobotOn = false;
function toggleRobot() {
  if (!isRobotOn) {
    interactiveObjIsOn = true;
    // robotRaycastBlock.scale.set(1,1,1);
    // robotList[0].visible = false;
    robotList[0].visible = true;
    robotList[1].visible = true;
    isRobotOn = true;
    controls.rotateSpeed = 0.4;
    controls.minDistance = 1.0;
  } else {
    interactiveObjIsOn = false;
    // robotRaycastBlock.scale.set(1,1,1);
    // robotList[0].visible = true;
    robotList[0].visible = false;
    robotList[1].visible = false;
    isRobotOn = false;
    controls.rotateSpeed = -0.4;
    controls.minDistance = 0.1;
  }
}

let isImageOn = false;
function toggleImage() {
  if (!isImageOn) {
    interactiveObjIsOn = true;
    imagePlane.visible = true;
    isImageOn = true;
  } else {
    interactiveObjIsOn = false;
    imagePlane.visible = false;
    isImageOn = false;
  }
}

let isVideoOn = false;
function toggleVideo(){
  if(isVideoOn){
    isVideoOn = false;
    videoPlayer1.stopVideo();
  }else{
    isVideoOn = true;
    videoPlayer1.playVideo();
  }
}