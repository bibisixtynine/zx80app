import {clear,print} from "./toolbox.js"

///////////////////////////////////////////////////
//
// 🌟 SPHERES 3D avec Playcanvas 🌟
//

// 🌐 Importation des librairies PlayCanvas et Ammo  
asyncImport('https://unpkg.com/ammo.js@0.0.10/ammo.js', main)
import "https://code.playcanvas.com/playcanvas-stable.min.js"
 
function asyncImport(url,func) {
  const script = document.createElement('script')
  script.src = url
  script.onload = func
  document.head.appendChild(script)  
}


///////////////////////////////////////////////////
// 🚀 MAIN ✨ //
////////////////
function main() {
  print('<center>👀<h1><orange>playcanvas</h1><br><purple>click to reset')
 
  let x = new X3d();
 
  // Paramètres du monde
  let worldSize = 10;
  let numSpheres = 500;
  let maxSpeed = 15
  let spheres = [];
 
  // Lumière et caméra
  let light = x.addAmbientLight(x.color(1, 1, 0.2), x.position(0, 0, 20));
  let camera = x.addCamera(x.color(0.1, 0.1, 0.1), x.position(0, 0, 25));
  let plane = x.addPlane(x.position(0, -5, 0), 10, x.rotation(15, 0, 0)); // Création d'un plan

  generateSpheres()

  x.onMouseClick( ()=> {
    resetSpheres()
  })

  // Mise à jour et mouvement des cubes
  x.onUpdate((dt) => {
  })
 
  // Création des spheres
  function generateSpheres() {
  for (let i = 0; i < numSpheres; i++) {
        let pos = x.position(Math.random() * worldSize - worldSize / 2, 20 + Math.random() * worldSize - worldSize / 2, Math.random() * worldSize - worldSize / 2);
        let size = x.size(1, 1, 1);
        let color = x.color(Math.random(), Math.random(), Math.random());
        let sphere = x.addSphere(pos, size, color);
        x.addMass(sphere,1)
        spheres.push({
            entity: sphere,
            velocity: x.position(Math.random() * maxSpeed - maxSpeed/2, Math.random() * maxSpeed - maxSpeed/2, Math.random() * maxSpeed - maxSpeed/2)
        });
    }
  }

  // Méthode pour effacer toutes les sphères et en régénérer de nouvelles
  function resetSpheres() {
        // Effacer toutes les sphères
        spheres.forEach(sphere => {
            x.removeSphere(sphere)
        });
        spheres = [];

        // Régénérer les sphères
        generateSpheres();
  }
 
 
}

///////////////////////////////////////////////////
// 🚀 X3d ✨ //
///////////////
class X3d {
      constructor() {
          // Initialisation de l'application PlayCanvas
          print('<canvas id="application" style="width:100vw; height:100vh"></canvas>')
          const canvas = document.getElementById('application')
          //const canvas = document.createElement('canvas');
          //document.body.appendChild(canvas);
          
          this.app = new pc.Application(canvas, {});
          this.app.start();
          this.app.systems.rigidbody.setGravity(0, -9.8, 0);
       
          this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
          this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
 
          // Gestion du redimensionnement
          window.addEventListener('resize', () => this.app.resizeCanvas());
      }
 
      color(r, g, b) {
          return new pc.Color(r, g, b);
      }
 
      position(x, y, z) {
          return new pc.Vec3(x, y, z);
      }
 
      size(x, y, z) {
          return new pc.Vec3(x, y, z);
      }
 
      rotation(x, y, z) {
          return new pc.Vec3(x, y, z);
      }
 
      addAmbientLight(color, position) {
          this.app.scene.ambientLight = color;
          const light = new pc.Entity();
          light.addComponent('light');
          this.app.root.addChild(light);
          light.setLocalPosition(position.x, position.y, position.z);
          return light;
      }
 
      addCamera(color, position) {
          const camera = new pc.Entity();
          camera.addComponent('camera', { clearColor: color });
          this.app.root.addChild(camera);
          camera.setPosition(position.x, position.y, position.z);
          return camera;
      }
 
      addSphere(position, size, color) {
          const sphere = new pc.Entity();
     
          // Ajout du composant 'model' avec le type 'box'
          sphere.addComponent('model', {
              type: 'sphere'
          });
     
          // Création d'un nouveau matériau avec la couleur spécifiée
          const material = new pc.StandardMaterial();
          material.diffuse = color;
          material.update();
     
          // Application du matériau au cube
          sphere.model.material = material;
     
          // Définition de la position du cube
          sphere.setPosition(position.x, position.y, position.z);
          sphere.setLocalScale(size.x, size.y, size.z);
 
          // Ajout du cube à la racine de l'application
          this.app.root.addChild(sphere);
     
          return sphere;
      }

      removeSphere(sphere) {
          // Désactiver les composants de physique
          if (sphere.entity.rigidbody) {
            sphere.entity.removeComponent('rigidbody');
          }
          if (sphere.entity.collision) {
              sphere.entity.removeComponent('collision');
          }
          this.app.root.removeChild(sphere.entity);
      }

      addPlane(position, scale, rotation) {
          const plane = new pc.Entity();
          plane.addComponent('model', {
              type: 'plane'
          });
          plane.setLocalScale(scale*2, scale*2 ,scale*2)
          plane.addComponent('rigidbody', {
              type: 'static'
          });
          plane.addComponent('collision', {
              type: 'box',
              halfExtents: new pc.Vec3(10, 0.01, 10) // Dimensions du plan
          });
     
          plane.setLocalPosition(position.x, position.y, position.z);
          plane.setLocalEulerAngles(rotation.x, rotation.y, rotation.z);
     
          this.app.root.addChild(plane);
          return plane;
      }
   
      addMass(entity, mass) {
          entity.addComponent('rigidbody', {
              type: 'dynamic',
              mass: mass
          });
          entity.addComponent('collision', {
              type: 'sphere',
              halfExtents: entity.getLocalScale().scale(1.0)
          });
      }

      onMouseClick(func) {
          // Gestion du click
          window.addEventListener("mousedown", (event) => {
              func(event);
          });

          // Gestion du tap sur les appareils tactiles
          window.addEventListener("touchstart", (event) => {
              func(event);
          });
      }
 
      onUpdate(callback) {
          this.app.on('update', callback);
      }
  }

