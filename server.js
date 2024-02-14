/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// server.js
//   
//

// libs

const Database = require("./Database");
const db = new Database('key_value_store')
db.open();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const fsPromises = require('fs').promises;
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware pour extraire le sous-domaine
app.use((req, res, next) => {
    const host = req.get('Host');
    const hostParts = host.split('.');
    if (hostParts.length > 2) {
        req.subdomain = hostParts[0];
    } else {
        req.subdomain = null;
    }
    next();
});

// Configuration de base
app.set('trust proxy', true);
app.use(cors());
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(express.static('public'));


///////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// (1/6) augmente console.log pour enregistrer aussi dans le repertoire jerome
//
const originalConsoleLog = console.log;
console.log = function() {
    const args = Array.from(arguments);
    const message = args.map(arg => {
        // Convertir les objets en chaînes JSON pour une meilleure lisibilité
        if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
        } else {
            return arg;
        }
    }).join(' ');
    originalConsoleLog.apply(console, arguments);  // Affiche dans la console
    fs.appendFile('public/zardoz42/log/app.js', message + '\n', err => {
        if (err) {
            originalConsoleLog('Erreur lors de l\'écriture dans log.txt:', err);
        }
    });
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
  console.log(`${formattedDate} ${userField} ${actionField} ${nameField} 🛜${ip}`);
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
  
  formattedLog(user,'SAVED  🛑',req.body.name,req.ip)
  
  try {
    let { name, image, description, code } = req.body;
    // Si 'name' est vide, lui attribuer la valeur 'Docs'
    name = name.trim() ? name : 'Docs';

    const appDir = 'public/' + user + '/' + name
    
    // a) Création des fichiers app.json et app.js
    await fsPromises.mkdir(appDir, { recursive: true });
    await fsPromises.writeFile(appDir + '/app.json', JSON.stringify({ name, image, description }));
    await fsPromises.writeFile(appDir + '/app.js', code);
    
    // b) Création du index.html
    let modelPath,indexPath,modelContent
    // Lire le contenu de index_model.html
    modelPath = './index_model.html'; // Chemin vers index_model.html
    modelContent = await fsPromises.readFile(modelPath, 'utf8');
    // Remplacer $${name} par la valeur de 'name'
    modelContent = modelContent.replace(/\$\${name}/g, user+'/'+name);
    // Sauvegarder le contenu modifié dans index.html
    indexPath = appDir + '/index.html'; // Chemin où index.html sera créé
    await fsPromises.writeFile(indexPath, modelContent);
    
    // c) Création du manifest.json
    // Lire le contenu de manifest_model.json
    modelPath = './manifest_model.json'; // Chemin vers manifest_model.json
    modelContent = await fsPromises.readFile(modelPath, 'utf8');
    // Remplacer $${name} par la valeur de 'name'
    modelContent = modelContent.replace(/\$\${name}/g, user+'/'+name);
    // Sauvegarder le contenu modifié dans manifest.json
    indexPath = appDir + '/manifest.json'; // Chemin où manifest.html sera créé
    await fsPromises.writeFile(indexPath, modelContent);

    // d) Création du sw.js
    // Lire le contenu de sw_model.js
    modelPath = './sw_model.js'; // Chemin vers sw_model.js
    modelContent = await fsPromises.readFile(modelPath, 'utf8');
    // Remplacer $${name} par la valeur de 'name'
    modelContent = modelContent.replace(/\$\${name}/g, user+'/'+name);
    // Sauvegarder le contenu modifié dans sw.js
    indexPath = appDir + '/sw.js'; // Chemin où manifest.html sera créé
    await fsPromises.writeFile(indexPath, modelContent);
    
    res.send(`😎🚀 <${name}> sauvegardée avec succès par <${user}>`);
    //res.status(500).send(`😢🛑 Sauvegarde Impossible jusqu'au 21 janvier 2024`);
  } catch (error) {
    res.status(500).send(`😢🛑 Erreur lors de la sauvegarde <${name}> par <${user}>`);
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
    const appDataKey = `${appKeyPrefix}/app.json`;
    const appCodeKey = `${appKeyPrefix}/app.js`;

    const appData = await db.get(appDataKey);
    const appCode = await db.get(appCodeKey);

    if (appData && appCode) {
      res.json({ ...JSON.parse(appData), code: appCode });
    } else {
      throw new Error('App data or code not found in the database.');
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
  const userDir = path.join('public', user);
  if (!await db.asKeyWithPrefix(user)) {
    formattedLog(user, 'is NEW \ud83e\udd29', '', ip);
    const sourceDir = path.join('public', 'zardoz42');
    let appsName = [];
    async function copyFiles(srcDir) {
      const entries = await fsPromises.readdir(srcDir, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(srcDir, entry.name);
        if (entry.isDirectory()) {
          appsName.push(entry.name)
          console.log(` ### PUSHED ${entry.name} ### `)
          await copyFiles(entryPath); // Recursive call for subdirectories
        } else {
          const fileContent = await fsPromises.readFile(entryPath, 'utf8');
          let fileKey = `${user}/${entryPath}`;
          fileKey = fileKey.replace('public/zardoz42/', ''); // Supress "public/zardoz42/" in fileKey
          console.log('Processing file:', fileKey);
          await db.set(fileKey, fileContent);
        }
      }
    }
    await copyFiles(sourceDir); // Start the recursive file copy
    await db.set(user, JSON.stringify(appsName));
    console.log(" ===> all files transferred to database")
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
    const appsListKey = `${user}`;
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
    originalConsoleLog(`Serveur démarré sur le port ${port}`);
});
//                                                                                    
// SERVER START
//
///////////////////////////////////////////////////////////////////////////////////////////


