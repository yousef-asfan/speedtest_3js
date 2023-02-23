import * as THREE from 'three';

export class VideoPlayer {
    scene;
    videlem;
    videoTexture;
    videoPlane;

    constructor(scene) {
        this.scene = scene;
    }
    createVideo() {
        let videlem = document.createElement("video");
        var sourceMP4 = document.createElement("source");
        sourceMP4.type = "video/mp4";
        sourceMP4.src = "./videos/asfan-vr-sevices.mp4";
        const video1 = new THREE.VideoTexture(videlem);
        videlem.appendChild(sourceMP4);

        videlem.autoplay = true;
        videlem.muted = true;
        videlem.setAttribute("crossorigin", "anonymous");

        videlem.style.display = "none";

        videlem.load();

        let videoTexture = new THREE.VideoTexture(videlem);
        videoTexture.crossOrigin = "anonymous";
        videoTexture.needsUpdate;
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;

        const videoPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(8, 4.5),
            new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide })
        );
        videoPlane.position.set(-50.5,0,-35);
        videoPlane.rotation.y = -Math.PI / 2;
        this.scene.add(videoPlane);
        this.videlem = videlem;
        this.videoTexture = videoTexture;
        this.videoPlane = videoPlane;
    }
    stopVideo(){
        this.videlem.pause();
        this.videlem.currentTime = 0;
        this.videoPlane.visible = false;
    }
    playVideo(){
        this.videoPlane.visible = true;
        this.videlem.play();
    }
}