import {EnergySphere} from "./EnergySphere";
import * as THREE from "../libs/three";

const TweenMax = require('../libs/TweenMax.min');

export class EnergyPumper {

  constructor(_energyPath, _scene) {
    this.scene = _scene;
    this.TICK_DELAY = 5;//seconds
    this.TARGET = 0;
    this.shperes_list = [];
    this.geometry = new THREE.SphereBufferGeometry(1, 32, 32);
    this.material = new THREE.MeshLambertMaterial({color: "#ffffff"});
    for (let i = 0; i < 4; i++) {
      let sphere = new EnergySphere(_energyPath, this.geometry, this.material);
      sphere.sphere.name = "1_sphere_" + i;
      this.shperes_list.push(sphere);
      this.scene.add(sphere.sphere);
    }
    this.clock = new THREE.Clock();
  }

  pump() {
    this.clock.start();
    TweenMax.ticker.addEventListener('tick', this.updateTick.bind(this));
  }

  updateTick() {
    let elipsedTime = this.clock.getElapsedTime();
    let limit = this.shperes_list.length;

    if (this.TARGET < limit) {
      if (elipsedTime > this.TICK_DELAY) {

        this.shperes_list[this.TARGET].go();

        this.TARGET++;
        this.clock.start();
      }
    } else {
      this.TARGET = 0;
    }
  }


}
