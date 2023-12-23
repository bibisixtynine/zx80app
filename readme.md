# QWARK ALPHA 0.1a
## the multi-platform T-PAC, Tiny - Phaser App Creator !


Are you looking to code with ease and fun tiny Game Apps ?

And more, how to distribute your wonderful Tiny Phaser Apps to everyone, regardless of the operating system he uses, or if it's a smartphone, a tablet, a laptop, a desktop, windows, osx, linux, android, ios etc...

Qwark is the first step for this project.

A tiny environment that allow to code, run and publish your apps on a store, using Phaser 3.7 2D library !

What is currently working for now :
  - qwark should work on any platform
  - editing (basic) with codemirror (syntax coloring)
  - run
  - load from the cloud
  - save&publish on the cloud... for registered user
  - fullscreen preview
  - the store is accessible at quark_web_adress/store 
  - debugging with chrome/chromium/edge/safari developper tools integrated in the explorer... on desktop
  - a couple of examples works nicely

What is not working/in progress :
  - W1 debugging request desktop explorer...
  - W2 there is no doc...
  - W3 missing relevant examples
  - W4 no interactive tutorial
  - W5 single file only
  - W6 assets must come from an url
  - W7 save&publish on the cloud... for registered user... only
   -W8 app names are bof bof
  
Bugs :
  - B1 too much ctr-z or command-z will get back to the initial doc loaded... and you will loose all modifications
  - B2 if you change app before saving it... you loose your changes
  - B3 after some time... the joystick is not responding correctly (see MyProject) 
  
  
  


## WARNING
If you remix this app on glitch, you will have to add a .env file with a variable named authorizedUser and the corresponding name (you can choose any value) that will be allowed to save/modify to your server some code... this a very basic identification ! ... for only one user.... no comment...

## MINIMAL REQUIREMENT TESTED (but may work on older configuration) :

As far as you can install the 2023 (lower version may also work... not tested) Chrome/Chromium/Thorium,microsoft edge/safari(17 on osx) webbrower version 119? or more, or , (with the exception of iOS, where Safari is a must), you'll be able to achieve this easily !
(min requirement ios 12 with Safari, osx catalina 10.15 with Chrome/Chromium, windows 7 (with Thorium), windows 10/11 with Chrome/Chromium/Thorium/Edge, Linux with Chrome/Chromium/Thorium, Android 6 with Chrome/Chromium
It may also works well with other browsers but without the install app functionnality and offline mode.

Tested on : 
Nexus 7 Android 6 latest Chrome, Moto G5 Android 7 latest Chrome, iPad Air iOS 15 Safari, iphone 6 iOS 12 Safari, osx 14 Safari/Chrome, Linux Ubuntu with 2023 Chrome/Chromium, windows 10 with 2023 Edge/Chrome/Chromium
