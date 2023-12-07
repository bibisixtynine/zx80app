const express = require('express');
const cors = require('cors');  // pour que le sw puisse intercepter les fetch des iframe.... ?

const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Utilisation de CORS pour toutes les requêtes
app.use(cors());

app.use(bodyParser.text());
app.use(bodyParser.json());

// Pour servir des fichiers statiques comme votre fichier HTML
app.use(express.static('public'));

const fsPromises = require('fs').promises;

app.post('/save', async (req, res) => {
  try {
    let { name, image, description, code } = req.body;
    
    // Si 'name' est vide, lui attribuer la valeur 'tempo'
    name = name.trim() ? name : 'tempo';
    
    const appDir = 'public/' + name
    
    // 1) Création des fichiers app.json et app.js
    await fsPromises.mkdir(appDir, { recursive: true });
    await fsPromises.writeFile(appDir + '/app.json', JSON.stringify({ name, image, description }));
    await fsPromises.writeFile(appDir + '/app.js', code);
    
    
    // 2) Création du index.html
    let modelPath,indexPath,modelContent
    // Lire le contenu de index_model.html
    modelPath = './index_model.html'; // Chemin vers index_model.html
    modelContent = await fsPromises.readFile(modelPath, 'utf8');
    // Remplacer $${name} par la valeur de 'name'
    modelContent = modelContent.replace(/\$\${name}/g, name);
    // Sauvegarder le contenu modifié dans index.html
    indexPath = appDir + '/index.html'; // Chemin où index.html sera créé
    await fsPromises.writeFile(indexPath, modelContent);
    
    // 3) Création du manifest.json
    // Lire le contenu de manifest_model.json
    modelPath = './manifest_model.json'; // Chemin vers manifest_model.json
    modelContent = await fsPromises.readFile(modelPath, 'utf8');
    // Remplacer $${name} par la valeur de 'name'
    modelContent = modelContent.replace(/\$\${name}/g, name);
    // Sauvegarder le contenu modifié dans manifest.json
    indexPath = appDir + '/manifest.json'; // Chemin où manifest.html sera créé
    await fsPromises.writeFile(indexPath, modelContent);

    // 4) Création du sw.js
    // Lire le contenu de sw_model.js
    modelPath = './sw_model.js'; // Chemin vers sw_model.js
    modelContent = await fsPromises.readFile(modelPath, 'utf8');
    // Remplacer $${name} par la valeur de 'name'
    modelContent = modelContent.replace(/\$\${name}/g, name);
    // Sauvegarder le contenu modifié dans sw.js
    indexPath = appDir + '/sw.js'; // Chemin où manifest.html sera créé
    await fsPromises.writeFile(indexPath, modelContent);

    
    
    
    // Copier toolbox.js dans le dossier de l'application sous le nom toolbox.js
    const modelPath2 = './public/toolbox.js'; // Chemin vers toolbox.js source
    const indexPath2 = appDir + '/toolbox.js'; // Chemin destination
    await fsPromises.copyFile(modelPath2, indexPath2);
    
    res.send(`😎🚀 <${name}> sauvegardée avec succcccès`);
  } catch (error) {
    res.status(500).send(`😢🛑 Erreur lors de la sauvegarde <${name}>`);
  }
});

// Route pour charger le code depuis le serveur
app.get('/load', (req, res) => {
    fs.readFile('code.txt', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send(`😢🛑 Erreur lors du chargement`);
        } else {
            res.send(data);
        }
    });
});


// Route pour lister les applications
app.get('/listApps', async (req, res) => {
  try {
    const appsDir = 'public';
    const entries = await fsPromises.readdir(appsDir, { withFileTypes: true }); // Utilisez withFileTypes pour obtenir des informations sur les entrées
    const dirs = [];

    for (const entry of entries) {
      if (entry.isDirectory()) { // Vérifie si l'entrée est un dossier
        dirs.push(entry.name);
      }
    }

    res.json(dirs);
  } catch (error) {
    res.status(500).send(`😭🛑 Liste des App introuvable`);
  }
});


// Route pour charger une application spécifique
app.get('/loadApp', async (req, res) => {
  try {
    const appName = req.query.name;
    const appDir = 'public/' + appName
    const appData = await fsPromises.readFile(appDir + '/app.json', 'utf8');
    const appCode = await fsPromises.readFile(appDir + '/app.js', 'utf8');
    res.json({ ...JSON.parse(appData), code: appCode });
  } catch (error) {
    res.status(500).send(`😭🛑 App introuvable`);
  }
});

// Route pour charger le store
app.get('/store', async (req, res) => {
  try {
    const appsDir = 'public';
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
                <a href="/${entry.name}/index.html" target="_blank" style="text-decoration: none; color: #20FF20; font-family: monospace; font-size: 14px; line-height: 1.2; width: 100%;">
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



app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
