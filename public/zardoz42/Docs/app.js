////////////////////////////////
//                            //
//     A FAIRE EN PREMIER     //
//                            //
//    Appuye sur le bouton    //
//                            //
//            </>             //
//                            //
//    en BAS à GAUCHE pour    //
// lancer cette App d'intro ! //
//                            //
////////////////////////////////

let ui = document.getElementById('ui')
ui.style.height = "auto"

let el = document.getElementById('gameContainer')
el.style.whiteSpace = 'pre-wrap'
el.style.overflow = 'auto'
el.style.margin = 'auto'
el.style.maxWidth = '500px'
el.innerHTML = `
<div id='phaser-scene' style="position:absolute; top:0; left:0; background:transparent; pointer-events: none;"></div>
<h1 style="color:yellow; text-align:center;">
---
Qwark
---
</h1>
<h1 style="color:orange">
👏 Bravissimo !
</h1>
Tu viens de lancer un aperçu de ta première webApp conçue avec <span style="color:yellow">Qwark</span> !
Pour revenir à son code, appuye à nouveau sur <i style="color:grey" class="fas fa-code"></i>.
Pour obtenir un lien à partager vers ta webApp, appuye sur <i style="color:grey" class="fas fa-link"></i> !
<h2 style="color:orange">
🧐 Qwark ? Quésaco ?
</h2>
<span style="color:yellow">Qwark</span> est une boîte à outils très pratique pour créer et partager facilement des mini-jeux, sous la forme de webApp !
<h2 style="color:orange">
😜 Quelques instructions...
</h2>
<i style="color:grey" class="fas fa-cloud-download-alt"></i> charge le code d'une de tes webApps

<i style="color:grey" class="fas fa-code"></i> lance ta webApp

<i style="color:grey" class="fas fa-code"></i> revient au code de ta webApp !

<i style="color:grey" class="fas fa-cloud-upload-alt"></i> sauvegarde tes changements

<i style="color:grey" class="fas fa-link"></i> récupère un lien vers ta webApp

<i style="color:grey" class="fas fa-plus"></i> créé une nouvelle webApp

<i style="color:grey" class="fas fa-cog"></i> affiche ton identifiant


<h2 style="color:orange">🤩 Installe Qwark ! Ton expérience utilisateur sera bien meilleur sans les barres de navigation.</h2>
<span style="color:orange">-></span> Sur iPhone&Cie, il faut appuyer sur le bouton de partage, représenté par un carré avec une flêche vers le haut, puis selectionner : "ajouter à l'écran d'accueil", ou "ajouter au dock"

<span style="color:orange">-></span> Sur Chrome, une icone à presser représentant un écran d'ordi avec une flêche vers le bas devrait apparaître automatiquement, sinon cherche dans le menu un item comme "installation"

<span style="color:orange">-></span> Tes webApps pour lesquelles tu auras passé un lien sont aussi installables !

N'hésite pas à partager cela avec tes utilisateurs !

<h2 style="color:orange">🥳 Amuse toi bien, et partage tes créations !</h2>

<h1 style="color:yellow; text-align:center;">Avanti 💫😋🚀 !</h1>




`
window.scrollTo(0,0)






