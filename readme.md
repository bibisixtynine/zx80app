# QWARK
## The online installable webapp inventor !


So you want to learn with fun how to code Apps ?

And more, how to distribute your wonderful Apps to everyone, regardless of the operating system he uses, or if it's a smartphone, a tablet, a laptop, a desktop, windows, osx, linux, android, ios etc...

As far as you can install the latest Chrome/Chromium/microsoft edge/safari(17 on osx) webbrower version 119? or more, or , (with the exception of iOS, where Safari is a must), you'll be able to achieve this easily !

Qwark is the first step for this project.

A tiny environment that allow to code, run and publish your apps on a store !

What is currently working for now :
  - qwark should work on any platform
  - editing (basic) with codemirror (code folding and syntax coloring)
  - run
  - load from the cloud
  - save (publish) on the cloud
  - fullscreen preview
  - the store is accessible at quark_web_adress/store 
  - debugging with chrome/chromium/edge/safari developper tools integrated in the explorer... on desktop
  - a couple of examples works nicely : clock, basic-template, phaser-basic, phaser-sprites

What is not working/in progress :
  - some other examples work but have problem when resizing/rotating the screen
  - debugging request desktop explorer...
  - there is no doc...
  - missing relevant and easy to understand examples
  
Roadmap :
  - Wondering for a version One of Qwark using Phaser 3.7 2D Game Engine only... could be a good step...



## WARNING
If you remix this app, you will have to add a .env file with a variable named authorizedUser and the corresponding name (you can choose any value) that will be allowed to save/modify to the server some code... this a very basic identification code ! ... for only one use.... no comment...