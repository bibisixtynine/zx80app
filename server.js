/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// server.js
//   
//

// libs
const express = require('express');
const cors = require('cors');  // pour que le sw puisse intercepter les fetch des iframe.... ?
const fs = require('fs');
const fsPromises = require('fs').promises;
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// surcharge de la fonction console.log pour qu'elle enregistre tout ce qui affiché dans la console dans un fichier log.txt
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
    originalConsoleLog.apply(console, arguments);  // Enregistrer dans la console
    fs.appendFile('log.txt', message + '\n', err => {
        if (err) {
            originalConsoleLog('Erreur lors de l\'écriture dans log.txt:', err);
        }
    });
};

// permet d'obtenir la véritable adresse de client d'après GPT
app.set('trust proxy', true);

// Middleware pour consigner les adresses IP
/*
app.use((req, res, next) => {
  const now = new Date();
  const logMessage = `
    Date/Heure: ${now.toISOString()}
    URL: ${req.originalUrl}
    Adresse IP du client: ${req.ip}`;
  next();
});*/

app.use(cors()); // Utilisation de CORS pour toutes les requêtes
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(express.static('public'));


///////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// 1) POST /save
//
app.post('/save', async (req, res) => {
  const user = req.body.user; // Ou obtenez l'identifiant de l'utilisateur via un jeton d'authentification
  let now = new Date();
  now.setHours(now.getHours() + 1); // utc+1
  let formattedDate = now.toISOString().replace('T', ' ').replace('Z', '').substring(0, 16) + "(UTC+1)";
  console.log(`${formattedDate} <${user}> 🛑SAVED <${req.body.name}>  🛜${req.ip}`);
  
  try {
    let { name, image, description, code } = req.body;
    // Si 'name' est vide, lui attribuer la valeur 'tempo'
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
// 2) GET /lispApps
//
const path = require('path');

async function copyDirectory(src, dest) {
  await fsPromises.mkdir(dest, { recursive: true });
  let entries = await fsPromises.readdir(src, { withFileTypes: true });
  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);
    entry.isDirectory() ? 
      await copyDirectory(srcPath, destPath) : 
      await fsPromises.copyFile(srcPath, destPath);
  }
}

// Route pour lister les applications
app.get('/listApps', async (req, res) => {
  const user = req.query.user;
  try {
    const appsDir = path.join('public', user);
    // nouveau user ? => création d'un nouveau répertoire et transfert du contenu
    // du répertoire modèle zardoz42
    if (!fs.existsSync(appsDir)) {
      console.log('🛑 NEW USER <',user,'>')
      // Transférer le contenu de zardoz42 vers le nouveau répertoire
      const sourceDir = path.join('public', 'zardoz42');
      await copyDirectory(sourceDir, appsDir);
    }
    // Lister le contenu du répertoire du user
    const entries = await fsPromises.readdir(appsDir, { withFileTypes: true });
    const dirs = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        dirs.push(entry.name);
      }
    }
    res.json(dirs);
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
// 3) GET /loadApp
//
app.get('/loadApp', async (req, res) => {
  const user = req.query.user; // Ou obtenez l'identifiant de l'utilisateur via un jeton d'authentification
  let now = new Date();
  now.setHours(now.getHours() + 1); // utc+1
  let formattedDate = now.toISOString().replace('T', ' ').replace('Z', '').substring(0, 16) + "(UTC+1)";
  console.log(`${formattedDate} <${user}> LOADED <${req.query.name}>  🛜${req.ip}`);
  try {
    const appName = req.query.name;
    const appDir = 'public/' + user + '/' + appName
    const appData = await fsPromises.readFile(appDir + '/app.json', 'utf8');
    const appCode = await fsPromises.readFile(appDir + '/app.js', 'utf8');
    res.json({ ...JSON.parse(appData), code: appCode });
  } catch (error) {
    res.status(500).send(`😭🛑 App introuvable`);
  }
});
//                                                                                    
// 3) GET /loadApp
//
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// 4) GET /store
//
app.get('/store', async (req, res) => {
  try {
    const appsDir = 'public/zardoz42';
    const entries = await fsPromises.readdir(appsDir, { withFileTypes: true });
    let html = `
    <html>
      <head>
        <title>Qwark Store</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="viewport-fit=cover,user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#f2b200" />
        <link rel="apple-touch-icon" href="https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/store-512.png?v=1700948777364" />
        <link id="favicon" rel="icon" href="https://cdn.glitch.global/e73a15d2-2f8a-477d-80bc-a6e8167fe97a/store-512.png?v=1700948777364" />
        <script>
          if (window.location.protocol == "https:") {
            console.log("🔒10 Running in https");
          } else if (
            window.location.protocol !== "https:" &&
            window.location.hostname !== "localhost" &&
            window.location.protocol !== "file:"
          ) {
            window.location.protocol = "https";
            console.log("🔒10 Enforcing https");
          } else {
            console.log("🛠️10 Running in localhost or file, not enforcing https");
          }
        </script>
        <style>
          body {
            font-family: monospace;
            background-color: black;
            color: #20FF20;
            margin: 0%;
            padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
          }
          #appButton {
            border: 2px solid #20FF20;
            border-radius: 10px;
            background-color: #001000;
            color: #20FF20;
            width: 100px;
            height: 100px;
            margin: 10px auto;
            padding: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            overflow: hidden;
            word-wrap: break-word;
          }
        </style>
      </head>
      <body>
        <h1 style="text-align: center;">Qwark Store v10</h1>
        <div style="display: flex; flex-wrap: wrap;">
    `

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Création d'un carré cliquable pour chaque application
        html += `
                <div id="appButton">
                <a href="/zardoz42/${entry.name}/index.html" target="_blank" style="text-decoration: none; color: #20FF20; font-family: monospace; font-size: 14px; line-height: 1.2; width: 100%;">
                  ${entry.name}
                </a>
                </div>
                `;
      }
    }

    html += '</div></body></html>';
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send(`😭🛑 Le Store est cassé`);
  }
});
//                                                                                    
// GET /store
//
///////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// SERVER START
//
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
//                                                                                    
// SERVER START
//
///////////////////////////////////////////////////////////////////////////////////////////
