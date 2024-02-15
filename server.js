/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// server.js
//   
//

// libs

(async () => {
  
const Database = require("./Database");
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const fsPromises = require('fs').promises;
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Configuration de base
app.set('trust proxy', true);
app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(express.static('public'));

const db = new Database('key_value_store')
await db.open();

///////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// (1/6) augmente console.log pour enregistrer aussi dans le repertoire jerome
//
log = async function() {
    const args = Array.from(arguments);
    const message = args.map(arg => {
        // Convertir les objets en JSON pour une meilleure lisibilitée
        if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
        } else {
            return arg;
        }
    }).join(' ');
    console.log(message);  // Affiche dans la console
    try {
        let log = await db.get('jerome/Logs/app.js')
        if (!log) log = ''
        await db.set('jerome/Logs/app.js', log + message + '\n');
    } catch (err) {
        originalConsoleLog('Erreur lors de l\u2019\u00e9criture dans la base de donn\u00e9es:', err);
    }
};
//                                                                                    
// augmente console.log pour enregistrer dans log.txt
//
///////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// (2/6) formatted log for Load and Save requests
//
function formattedLog(user,action,appName,ip) {
  let now = new Date();
  now.setHours(now.getHours() + 1); // utc+1
  let formattedDate = now.toISOString().replace('T', ' ').replace('Z', '').substring(0, 16);

  // longueur de chaque champ
  const userFieldLength = 15;  // Longueur pour le nom d'utilisateur
  const actionFieldLength = 10; // Longueur pour l'action (LOADED, SAVED, etc.)
  const appNameFieldLength = 20;  // Longueur pour le nom de la requête

  // Ajustage de chaque champ à la longueur
  let userField = `<${user}>`.padEnd(userFieldLength);
  let actionField = action.padEnd(actionFieldLength);
  let nameField = `<${appName}>`.padEnd(appNameFieldLength);

  // Construction et affichage du message de journal
  log(`${formattedDate} ${userField} ${actionField} ${nameField} 🛜${ip}`);
}
//                                                                                    
// formatted log pour Load and Save
//
///////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// (3/6) POST /save
//   -> a besoin de app, formattedLog, 

app.post('/save', async (req, res) => {
  const user = req.body.user; // identifiant de l'utilisateur
  
  formattedLog(user,'SAVED  \\ud83d\\udd34',req.body.name,req.ip)
  
  try {
    let { name, code } = req.body;
    // Si 'name' est vide, lui attribuer la valeur 'Docs'
    name = name.trim() ? name : 'Docs';

    const appKeyPrefix = `${user}/${name}`;
    const appCodeKey = `${appKeyPrefix}/app.js`;

    // a) Sauvegarde des fichiers app.js dans la base de donnees
    await db.set(appCodeKey, code);

    // b) Mise \\u00e0 jour de la liste des applications de l'utilisateur dans la base de donnees
    const appsListKey = `${user}/apps`;
    let appsList = await db.get(appsListKey);
    appsList = appsList ? JSON.parse(appsList) : [];
    if (!appsList.includes(name)) {
      appsList.push(name);
      await db.set(appsListKey, JSON.stringify(appsList));
    }

    res.send(`\\ud83d\\ude0e\\u2708 <${name}> sauvegard\\u00e9e avec succ\\u00e8s par <${user}>`);
  } catch (error) {
    res.status(500).send(`\\ud83d\\ude22\\ud83d\\udd34 Erreur lors de la sauvegarde <${name}> par <${user}>`);
  }
});
//                                                                                    
// POST /save
//
/////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// (4/6) GET /loadApp OK
//
app.get('/loadApp', async (req, res) => {
  const user = req.query.user;
  formattedLog(user,'LOADED',req.query.name,req.ip)
  try {
    await checkAndCreateUserDir(user);

    const appName = req.query.name;
    const appKeyPrefix = `${user}/${appName}`;
    const appCodeKey = `${appKeyPrefix}/app.js`;

    const appCode = await db.get(appCodeKey);

    if (appCode) {
      res.json({ name: appName, code: appCode });
    } else {
      throw new Error('code not found in the database.');
    }
  } catch (error) {
    res.status(500).send(`No app <${req.query.name}> missing for user <${req.query.user}>`);
  }
});
//                                                                                    
// GET /loadApp
//
/////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////
//
// (5/6) Fonction pour vérifier et créer le répertoire de l'utilisateur
//
async function checkAndCreateUserDir(user, ip) {
  if (!await db.asKeyWithPrefix(user+'/apps')) {
    formattedLog(user, 'is NEW \ud83e\udd29', '', ip);
    const sourceDir = 'defaultApps';
    let appsName = [];
    async function copyFiles(srcDir) {
      const entries = await fsPromises.readdir(srcDir, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(srcDir, entry.name);
        if (entry.isDirectory()) {
          appsName.push(entry.name)
          //console.log(` ### PUSHED ${entry.name} ### `)
          await copyFiles(entryPath); // Recursive call for subdirectories
        } else {
          const fileContent = await fsPromises.readFile(entryPath, 'utf8');
          let fileKey = `${user}/${entryPath}`;
          fileKey = fileKey.replace('defaultApps/', ''); // Supress "public/zardoz42/" in fileKey
          //console.log('Processing file:', fileKey);
          await db.set(fileKey, fileContent);
        }
      }
    }
    await copyFiles(sourceDir); // Start the recursive file copy
    await db.set(user+'/apps', JSON.stringify(appsName));
    //console.log(" ===> all files transferred to database")
  }
}
//
/////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// (6/6) GET /lispApps
//
// Route pour lister les applications
app.get('/listApps', async (req, res) => {
  const user = req.query.user;
  try {
    await checkAndCreateUserDir(user, req.ip);
    // Retrieve the list of apps from the database with key user
    const appsListKey = `${user}/apps`;
    const appsListJson = await db.get(appsListKey);
    const appsList = JSON.parse(appsListJson);
    res.json(appsList);
  } catch (error) {
    console.error(error);
    res.status(500).send(`😭🛑 Liste des App introuvable`);
  }
});
//                                                                                    
// GET /lispApps
//
///////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// SERVER START
//
app.listen(port, () => {
    let now = new Date();
    now.setHours(now.getHours() + 1); // utc+1
    let formattedDate = now.toISOString().replace('T', ' ').replace('Z', '').substring(0, 16);
  
    log(`💫🤩🚀 ${formattedDate} - Serveur démarré sur le port ${port}`);
});
//                                                                                    
// SERVER START
//
///////////////////////////////////////////////////////////////////////////////////////////

})();
