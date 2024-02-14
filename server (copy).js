/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// server.js
//   
//

// libs

// 
  /*console.log('💫🤓🚀 starting server ...');
  const Database = require("@replit/database");
  const db = new Database();

  let oldValue
  db.get("secret")
    .then(value => {
      oldValue = value;
      console.log('💫🤓🚀 db get ',value);
        db.set("secret", oldValue + "abcdef")
          .then( () => {
            console.log('💫🤓🚀 db set');
            db.get("secret")
              .then(value => {
                console.log('💫🤓🚀 db get ',value)
              })
          })
    });;
*/

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
// augmente console.log pour enregistrer aussi dans le repertoire jerome
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
    fs.appendFile('public/jerome/log/app.js', message + '\n', err => {
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
// formatted log for Load and Save requests
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
// 1) POST /save
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
// 2) GET /loadApp
//
app.get('/loadApp', async (req, res) => {
  const user = req.query.user;
  formattedLog(user,'LOADED',req.query.name,req.ip)
  try {
    await checkAndCreateUserDir(user);

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
// GET /loadApp
//
/////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////
// Fonction pour vérifier et créer le répertoire de l'utilisateur
async function checkAndCreateUserDir(user, ip) {
  const userDir = path.join('public', user);
  if (!fs.existsSync(userDir)) {
    formattedLog(user, 'is NEW 🤩', '', ip);
    const sourceDir = path.join('public', 'zardoz42');
    await copyDirectory(sourceDir, userDir);
  }
}
//
/////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// 3) GET /lispApps
//
// const path = require('path');

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
    await checkAndCreateUserDir(user, req.ip);
    // Lister le contenu du répertoire du user
    const appsDir = path.join('public', user);
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






/////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// 5) Authentification avec Github
//
const fetch = require('node-fetch');

// Variables d'environnement pour les identifiants GitHub
const clientId = process.env.ClientId;
const clientSecret = process.env.ClientSecret;

// Fonction pour échanger le code contre un token
function exchangeCodeForToken(code) {
    return new Promise((resolve, reject) => {
        fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code
            })
        })
        .then(response => response.json())
        .then(tokenData => resolve(tokenData))
        .catch(error => reject(error));
    });
}

// Route pour initier la connexion via GitHub
app.get('/login', (req, res) => {
    // Redirection vers GitHub pour authentification
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
    res.redirect(githubAuthUrl);
});

// Route pour gérer le callback de GitHub
/*app.get('/github/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Code not found');
    }

    try {
        const tokenData = await exchangeCodeForToken(code);
        // Traiter les données reçues de GitHub
        console.log(tokenData);
        // Ici, vous pouvez rediriger l'utilisateur vers une page de votre application avec les données reçues
        res.send('Connexion réussie'); // Modifiez cette partie selon vos besoins
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});*/

// Route pour gérer le callback de GitHub
app.get('/github/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Code not found');
    }

    try {
        const tokenData = await exchangeCodeForToken(code);
        if (!tokenData.access_token) {
            return res.status(400).send('Token not found');
        }

        // Utiliser le token pour obtenir les informations de l'utilisateur
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${tokenData.access_token}`
            }
        });
        const userData = await userResponse.json();

        // Maintenant, userData contient les informations de l'utilisateur, y compris le nom d'utilisateur
        console.log(userData);
        const username = userData.login; // Le nom d'utilisateur GitHub

        // Vous pouvez maintenant utiliser ces informations comme vous le souhaitez
        res.redirect(`/?username=${encodeURIComponent(userData.login)}&avatar_url=${encodeURIComponent(userData.avatar_url)}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
//                                                                                    
// Authentification avec Github
//
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// 6) Sous-domaines
//
app.get('*', (req, res, next) => {
    if (req.subdomain) {
        handleSubdomainRequest(req, res);
    } else {
        next();
    }
});

function handleSubdomainRequest(req, res) {
    const subdomain = req.subdomain;
    res.send(`Vous êtes sur le sous-domaine : ${subdomain}`);
}
//                                                                                    
// Sous-domaines
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


