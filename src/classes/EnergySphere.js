import * as THREE from "../libs/three";
const TweenMax = require('../libs/TweenMax.min');


export class EnergySphere{

    constructor(_energyPath,  _geometry, _material){
        this.TICK_PATH = 0;
        this.TICK_DELAY = .1;//seconds

        this.energyPath = _energyPath;
        this.sphere = new THREE.Mesh( _geometry, _material );
        // sphere.position.y = 10 ;
        this.sphere.name = "sphere";
        // scene.add( sphere );
        this.clockPath = new THREE.Clock();

    }

    go(){
        this.clockPath.start();
        TweenMax.ticker.addEventListener('tick', this.updatePaths.bind(this));
    }

    updatePaths(){
        let elipsedTime = this.clockPath.getElapsedTime();
        // console.log("tick updatePaths");
        // console.log(elipsedTime);
        // console.log(clock.getDelta());
        // let limit = energyPath_vec3.length;
        let points = this.energyPath.getPoints(100);
        let limit = points.length;

        if (this.TICK_PATH < limit){
            if (elipsedTime > this.TICK_DELAY){
                let newPos = points[this.TICK_PATH];

                new TimelineMax()
                    .to( this.sphere.position, 1, {
                        x:  newPos.x,
                        y:  newPos.y,
                        z:  newPos.z,
                        // ease: Linear
                    });

                // sphere.position.x = newPos.x;
                // sphere.position.y = newPos.y;
                // sphere.position.z = newPos.z;

                this.TICK_PATH++;
                this.clockPath.start();
            }
        }else{
            this.TICK_PATH = 0;
            this.clockPath.stop();


        }
    }



}
