///////////////////////
// The Digital Clock //
///////////////////////

import {clear, print} from './toolbox.js'

setInterval( ()=> {
  let maintenant = new Date()
  let heures = maintenant.getHours().toString().padStart(2, '0')
  let minutes = maintenant.getMinutes().toString().padStart(2, '0')
  let secondes = maintenant.getSeconds().toString().padStart(2, '0')
  let horloge = `${heures}:${minutes}:${secondes}`
  clear()
  print('<center><h1>',horloge,'<br><h3>',formaterDate(new Date()))
}, 1000)

 
function obtenirNumeroSemaine(date) {
    const premierJanvier = new Date(date.getFullYear(), 0, 1);
    const jours = Math.floor((date - premierJanvier) / (24 * 60 * 60 * 1000));
    return Math.ceil((date.getDay() + 1 + jours) / 7);
}

function formaterDate(date) {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

    let jourSemaine = jours[date.getDay()];
    let jourMois = date.getDate();
    //let moisAnnee = mois[date.getMonth()];
    let moisAnnee = date.getMonth();
    let annee = date.getFullYear();
    let numeroSemaine = obtenirNumeroSemaine(date);

    return `${jourSemaine} ${jourMois}/${moisAnnee}/${annee}<br>semaine ${numeroSemaine}`;
}   