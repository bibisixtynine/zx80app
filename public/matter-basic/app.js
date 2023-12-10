




//////////////////
// matter-basic //
//////////////////


import {clear, print} from "/toolbox.js"

syncImport('https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js', main)
 
print('<center>👀<h1><orange>matter.js</h1>')
setTimeout(clear, 3000)

function main() {
  // module aliases
  var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;
 
  // create an engine
  var engine = Engine.create();
 
  // Créer un rendu
  var render = Render.create({
      element: document.getElementById('ui'),
      engine: engine,
      // Définir les dimensions initiales à celles de la fenêtre
      options: {
          width: window.innerWidth,
          height: window.innerHeight
      }
  });
 
  // create two boxes and a ground
  var boxA = Bodies.rectangle(400, 200, 80, 80);
  var boxB = Bodies.rectangle(450, 50, 80, 80);
  var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
 
  // add all of the bodies to the world
  Composite.add(engine.world, [boxA, boxB, ground]);
 
  // run the renderer
  Render.run(render);
 
  // create runner
  var runner = Runner.create();
 
  // run the engine
  Runner.run(runner, engine);

  // Fonction pour ajuster la taille du rendu
  function resizeCanvas() {
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      render.options.width = window.innerWidth;
      render.options.height = window.innerHeight;
    
      Render.lookAt(render, Composite.allBodies(engine.world));
  }

  // Écouteur d'événements pour ajuster la taille lors du redimensionnement de la fenêtre
  window.addEventListener('resize', resizeCanvas);

  // Appel initial pour configurer la taille
  resizeCanvas();

  // Fonction pour relancer la scène
  function restartScene() {
      // Effacer les corps existants
      Composite.clear(engine.world, false);
      // Ajouter de nouveaux corps
      var boxA = Bodies.rectangle(400, 200, 80, 80);
      var boxB = Bodies.rectangle(450, 50, 80, 80);
      var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
      Composite.add(engine.world, [boxA, boxB, ground]);
  }

  // Programmer le redémarrage de la scène toutes les 5 secondes (5000 millisecondes)
  setInterval(restartScene, 5000);
}


function syncImport(url,func) {
  const script = document.createElement('script')
  script.src = url
  script.onload = func
  document.head.appendChild(script)  
}



