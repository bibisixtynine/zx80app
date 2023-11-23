import {clear,print,printf} from "./toolbox.js"

/////////////////////////////////////////////////////////////
//
// 🤖 README FIRST
//
//  Use chrome brower debug window for debugging (only on desktop 🥲)
//    . Press option+command+i on chrome osx,
//    . Use the 'console' tab to see the errors message while you
//      are typing code,
//    . Add 'debugger' instruction (without brackets) to add a breakpoint
//      anywhere in your code in this page,
//    . Each time you type a character... the app auto relaunch.
//
//  ✅ Done !
//

//////////////////////////
//
// 👾 PIXEL APP 1.0
//

// some printings
print('<orange>the <yellow>Pixel App<orange> 1.0<br>')


// add a drawing canvas for the pixel app !
printf('<canvas style="border: solid 2px orange; border-radius: 15px; touch-action:none; width:80%" class="rainbow-pixel-canvas"></canvas>')

// some more printings


/////////////////////////////////////////////////////////////
//
// the pixel app... could work as it is a static html file...
//
// <html>
//   <head>
//   </head>
//   <body>
//     <script type='module'> ... adding all the content of this file here ! </scr ipt>
//   </body>
// </html>
// 
// STRANGE BUG : NEVER PUT THE correct</sc ript> in the comment...


import interact from 'https://cdn.interactjs.io/v1.10.11/interactjs/index.js';

var pixelSize = 16;

interact('.rainbow-pixel-canvas')
  .draggable({
    autoScroll: false,
    max: Infinity,
    maxPerElement: Infinity,
    origin: 'self',
    modifiers: [
      interact.modifiers.snap({
      // snap to the corners of a grid
        targets: [
          interact.snappers.grid({ x: pixelSize, y: pixelSize }),
        ],
      }),
    ],
    listeners: {
      // draw colored squares on move
      move: function (event) {
        var context = event.target.getContext('2d');
        // calculate the angle of the drag direction
        var dragAngle =
          (180 * Math.atan2(event.dx, event.dy)) / Math.PI;
        // set color based on drag angle and speed
        context.fillStyle =
          'hsl(' +
          dragAngle +
          ', 86%, ' +
          (30 + Math.min(event.speed / 1000, 1) * 50) +
          '%)';
        // draw squares
        context.fillRect(
          event.pageX - pixelSize / 2,
          event.pageY - pixelSize / 2,
          pixelSize,
          pixelSize
        );
      },
    },
  })
  // clear the canvas on doubletap
  .on('doubletap', function (event) {
    var context = event.target.getContext('2d');
    context.clearRect(
      0,
      0,
      context.canvas.width,
      context.canvas.height
    );
    resizeCanvases();
  });

function resizeCanvases() {
  [].forEach.call(
    document.querySelectorAll('.rainbow-pixel-canvas'),
    function (canvas) {
      delete canvas.width;
      delete canvas.height;
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  );
}

resizeCanvases();
 
// interact.js can also add DOM event listeners
interact(window).on('resize', resizeCanvases);