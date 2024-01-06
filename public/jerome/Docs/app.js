




// App Doc

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


let el = document.getElementById('gameContainer')
el.style.whiteSpace = 'pre-wrap'
el.style.overflow = 'auto'
el.style.margin = 'auto'
el.style.maxWidth = '500px'
el.innerHTML = `
<h1 style="color:yellow">
-----
Qwark
-----
</h1>
<h1 style="color:orange">
Bravo !
</h1>
Tu viens de lancer une première App conçue avec <span style="color:yellow">Qwark</span> en appuyant sur le bouton <i style="color:grey" class="fas fa-code"></i> !
<h2 style="color:orange">
Quark ? Quésaco ?
</h2>

Quark est une boîte à outils très pratique pour partager facilement sur ton tel, ta tablette ou ton ordi des mini-jeux... que tu auras créés pour les drôles de 7 à 77 ans !

<h2 style="color:orange">
Quelques instructions utiles et pas futiles...
</h2>
(quand tu seras revenu au code de cette App)

<span style="color:orange">1)</span> <i style="color:grey" class="fas fa-cloud-download-alt"></i> sert à choisir de charger le code d'une autre App

<span style="color:orange">2)</span> <i style="color:grey" class="fas fa-code"></i> pour lancer l'App

<span style="color:orange">3)</span> <i style="color:grey" class="fas fa-code"></i> pour revenir au code de l'App!

<span style="color:orange">4)</span> <i style="color:grey" class="fas fa-cloud-upload-alt"></i> permet de sauvegarder tes changements sur ton cloud

<span style="color:orange">5)</span> <i style="color:grey" class="fas fa-link"></i> récupère un lien internet à coller et partager pour que d'autres jouent avec ton App

<span style="color:orange">6)</span> <i style="color:grey" class="fas fa-plus"></i> permet de créer une nouvelle App dans ton cloud à partir de l'App courante 

<span style="color:orange">7)</span> <i style="color:grey" class="fas fa-cog"></i> contient le nom de ton dossier ou sont rangé tes Apps


<h2 style="color:orange">Installe Qwark ! Ton experience utilisateur sera bien meilleur sans les barres de navigation.</h2>
-> Sur iPhone&Cie, il faut appuyer sur le bouton de partage, représenté par un carré avec une flêche vers le haut, puis selectionner : ajouter à l'écran d'accueil.

-> Sur Chrome, une icone à presser représentant un écran d'ordi avec une flêche vers le bas devrait apparaître automatiquement, sinon cherche dans le menu un item comme "installation"

-> Tes Apps pour lesquelles tu auras passé un lien sont aussi installables !

N'hésite pas à partager cela avec tes utilisateurs !

<span style="color:orange">ps:</span> Ce type d'app est une PWA, une Progressive Web App.

<h2 style="color:orange">
Amuse toi bien, et partage tes créations !
</h2>
<h1 style="color:yellow">
Avanti !
</h1>




`