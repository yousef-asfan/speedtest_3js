import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'



const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const textureLoader = new THREE.TextureLoader();

export class AddInteractiveItem {
    scene;
    triggers = [];
    itemsList = [];
    videoPlayer;

    constructor(scene, videoPlayer) {
        this.scene = scene;
        this.videoPlayer = videoPlayer;
    }
    initDraw() {
        this.drawRobot();
        this.drawImage();
        this.drawVideo();
    }
    drawRobot() {
        const tex_arm = textureLoader.load('./textures/arm_color.jpg');
        tex_arm.flipY = false;
        const tex_base = textureLoader.load('./textures/base_color.jpg');
        tex_base.flipY = false;
        gltfLoader.load('./models/robotArm.glb', (gltf) => {
            gltf.scene.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    if (obj.name == 'robotArm') {
                        obj.material = new THREE.MeshBasicMaterial({ map: tex_arm });
                        obj.position.y -= 0.5;
                        obj.visible = false;
                        this.itemsList.push(obj);
                    } else {
                        obj.material = new THREE.MeshBasicMaterial({ map: tex_base });
                        obj.position.y -= 0.5;
                        obj.visible = false;
                        this.itemsList.push(obj);
                    }
                }
            });
            this.scene.add(gltf.scene);
        });
        const robot_trigger = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 1, 0.6),
            new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
        );
        this.triggers.push(robot_trigger);
        robot_trigger.visible = false;
        robot_trigger.position.set(-5.4, -1.35, -4.8);
        robot_trigger.name = 'robot_t';
        this.scene.add(robot_trigger);
    }

    drawImage() {
        const image_trigger = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 0.5),
            new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
        );
        this.triggers.push(image_trigger);
        image_trigger.visible = false;
        image_trigger.position.set(-31, -0.1, 1.5);
        image_trigger.name = 'image_t';
        this.scene.add(image_trigger);

        const tex_map = textureLoader.load('./textures/map.jpg');
        tex_map.flipY = false;
        const imagePlane = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 6),
            new THREE.MeshBasicMaterial({ map: tex_map, side: THREE.BackSide })
        );
        imagePlane.name = 'image_t';
        this.triggers.push(imagePlane);
        imagePlane.rotation.z = Math.PI;
        imagePlane.position.set(-31, -0.1, 0.1);
        imagePlane.visible = false;
        this.itemsList.push(imagePlane);
        this.scene.add(imagePlane);
    }

    drawVideo() {
        this.videoPlayer.createVideo();
        this.videoPlayer.stopVideo();
        const videoBox = new THREE.Mesh(
            new THREE.BoxGeometry(8, 4.5, 0.3, 2, 2, 2),
            new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
        );
        videoBox.position.set(-50.4, 0, -35);
        videoBox.rotation.y = -Math.PI / 2;
        videoBox.visible = false;
        videoBox.name = 'video_t';
        this.triggers.push(videoBox);
        this.scene.add(videoBox);
    }

    returnTriggers() {
        return this.triggers;
    }
    returnItem(index) {
        return this.itemsList[index];
    }
}