/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// server.js
//
//

// libs

(async () => {
  const { getUserInfo } = require("@replit/repl-auth");

  const Database = require("./Database3");
  const express = require("express");
  const cors = require("cors");
  const fsPromises = require("fs").promises;
  const bodyParser = require("body-parser");
  const path = require("path");
  const app = express();
  const port = process.env.PORT || 3000;

  // Configuration de base
  app.set("trust proxy", true);
  app.use(cors());
  app.use(bodyParser.text());
  app.use(bodyParser.json());
  app.use(express.static("public"));

  const db = new Database("key_value_store");

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // (x/y) getApp available public code without being logged
  //
  // ex: https://zx80.app/publicApp/MyApp
  //app.get("/publicApp/:appName/*", (req, res) => {
  //  const appName = req.params.appName;
  //  const additionnalPath = req.params[0];
  //  res.send(`Welcome to ${appName} ${additionnalPath}`);
  //});
  //
  // (x/y) getApp available public code without being logged
  //
  ///////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////////////////////////////////////////////////////////
//                                                                                    
// 1) GET /publicApp/:appName
//   => url -> additionnalPath
//   => zx80.app/publicApp/MyApp/ -> index.html
//   => zx80.app/publicApp/MyApp/index.html -> index.html
//   => zx80.app/publicApp/MyApp/manifest.json -> manifest.json
//   => zx80.app/publicApp/MyApp/style.css -> style.css
//   => zx80.app/publicApp/MyApp/script.js -> script.js
//   => zx80.app/publicApp/MyApp/images/logo.png -> images/logo.png
  

app.get('/publicApp/:appName/*', async (req, res) => {
  const appName = req.params.appName;
  const additionalPath = req.params[0] || 'index.html';
  res.send(appName + ' is running on ' + additionalPath);
  //formattedLog(user,'SAVED  🛑',req.body.name,req.ip)

  /*
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
  } catch (error) {
    res.status(500).send(`😢🛑 Erreur lors de la sauvegarde <${name}> par <${user}>`);
  }*/
});
//                                                                                    
// POST /save
//
/////////////////////////////////////////////////////////////////////////////////////////


















  
  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // (0/6) replit logging
  //
  app.get("/", function (req, res) { // ????? not reachable ???
    res.sendFile(__dirname + "/index.html");
  });

  app.get("/getUsername", function (req, res) {
    const user = getUserInfo(req);
    if (user) {
      res.send(user.name);
    } else {
      res.send("not logged in");
    }
  });
  //
  // (0/6) replit logging
  //
  ///////////////////////////////////////////////////////////////////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // (1/6) augmente console.log pour enregistrer aussi dans le repertoire ilboued
  //
  log = async function () {
    const args = Array.from(arguments);
    const message = args
      .map((arg) => {
        // Convertir les objets en JSON pour une meilleure lisibilitée
        if (typeof arg === "object") {
          return JSON.stringify(arg, null, 2);
        } else {
          return arg;
        }
      })
      .join(" ");
    console.log(message); // Affiche dans la console
    try {
      let log = await db.get("ilboued/Logs/app.js");
      if (!log) log = "";
      await db.set("ilboued/Logs/app.js", log + message + "\n");
    } catch (err) {
      originalConsoleLog(
        "Erreur lors de l'écriture dans la base de données:",
        err,
      );
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
  function formattedLog(user, action, appName, ip) {
    let now = new Date();
    now.setHours(now.getHours() + 1); // utc+1
    let formattedDate = now
      .toISOString()
      .replace("T", " ")
      .replace("Z", "")
      .substring(0, 16);

    // longueur de chaque champ
    const userFieldLength = 15; // Longueur pour le nom d'utilisateur
    const actionFieldLength = 10; // Longueur pour l'action (LOADED, SAVED, etc.)
    const appNameFieldLength = 20; // Longueur pour le nom de la requête

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


  
/////////////////////////////////////////////////////////////////////////////////////////
//
// GET /askai
// 
app.post('/askai', async (req, res) => {
  const { code } = req.body; // Extraire 'code' du corps de la requête
  if (!code) {
    return res.status(400).send('Code is required.');
  }
  try {
    const ZXai = require('./ZXai');
    const zxai = new ZXai();
    
    const answer = await zxai.ask(code);
    
    res.json({
      code: answer,
      comment: "no comment" 
    }); // Send the code and comments as a response
  } catch (error) {
    console.error('Error asking AI:', error);
    res.status(500).send('Failed to get an answer from AI.');
  }
});
//
// GET /askai
// 
/////////////////////////////////////////////////////////////////////////////////////////



  
  ///////////////////////////////////////////////////////////////////////////////////////
  //
  // (3/6) POST /save
  //   -> a besoin de app, formattedLog,

  app.post("/save", async (req, res) => {
    //const user = req.body.user; // identifiant de l'utilisateur
    const userInfo = getUserInfo(req);
    const user = userInfo ? userInfo.name : null;

    if (user) {
      formattedLog(user, "SAVED 💋", req.body.name, req.ip);

      try {
        let { name, code } = req.body;
        // Si 'name' est vide, lui attribuer la valeur 'Docs'
        name = name.trim() ? name : "Docs";

        const appKeyPrefix = `${user}/${name}`;
        const appCodeKey = `${appKeyPrefix}/app.js`;

        // a) Sauvegarde des fichiers app.js dans la base de donnees
        await db.set(appCodeKey, code);

        // b) Mise à jour de la liste des applications de l'utilisateur dans la base de donnees
        const appsListKey = `${user}/apps`;
        let appsList = await db.get(appsListKey);
        appsList = appsList ? JSON.parse(appsList) : [];
        if (!appsList.includes(name)) {
          appsList.push(name);
          await db.set(appsListKey, JSON.stringify(appsList));
        }

        res.send(`<${name}> sauvegardé avec succés par <${user}>`);
      } catch (error) {
        res
          .status(500)
          .send(`Erreur lors de la sauvegarde <${name}> par <${user}>`);
      }
    } else {
      formattedLog(req.ip, "tried to SAVE ☠️", "", "");
      res
        .status(401)
        .send("Vous devez être connecté pour sauvegarder une application");
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
  app.get("/loadApp", async (req, res) => {
    const userInfo = getUserInfo(req);
    const user = userInfo ? userInfo.name : null;

    if (user) {
      formattedLog(user, "LOADED", req.query.name, req.ip);
      try {
        await checkAndCreateUserDir(user);

        const appName = req.query.name;
        const appKeyPrefix = `${user}/${appName}`;
        const appCodeKey = `${appKeyPrefix}/app.js`;

        const appCode = await db.get(appCodeKey);

        if (appCode) {
          res.json({ name: appName, code: appCode });
        } else {
          throw new Error("code not found in the database.");
        }
      } catch (error) {
        res
          .status(500)
          .send(
            `No app <${req.query.name}> missing for user <${req.query.user}>`,
          );
      }
    } else {
      formattedLog(req.ip, "tried to LOAD ☠️", "", "");
      res
        .status(500)
        .send("Vous devez être connecté pour charger une application");
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
    if (!(await db.hasKeyWithPrefix(user + "/apps"))) {
      formattedLog(user, "is NEW \ud83e\udd29", "", ip);
      const sourceDir = "defaultApps";
      let appsName = [];
      async function copyFiles(srcDir) {
        const entries = await fsPromises.readdir(srcDir, {
          withFileTypes: true,
        });
        for (const entry of entries) {
          const entryPath = path.join(srcDir, entry.name);
          if (entry.isDirectory()) {
            appsName.push(entry.name);
            //console.log(` ### PUSHED ${entry.name} ### `)
            await copyFiles(entryPath); // Recursive call for subdirectories
          } else {
            const fileContent = await fsPromises.readFile(entryPath, "utf8");
            let fileKey = `${user}/${entryPath}`;
            fileKey = fileKey.replace("defaultApps/", ""); // Supress "public/zardoz42/" in fileKey
            //console.log('Processing file:', fileKey);
            await db.set(fileKey, fileContent);
          }
        }
      }
      await copyFiles(sourceDir); // Start the recursive file copy
      await db.set(user + "/apps", JSON.stringify(appsName));
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
  app.get("/listApps", async (req, res) => {
    const userInfo = getUserInfo(req);
    const user = userInfo ? userInfo.name : null;

    if (user) {
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
    } else {
      formattedLog(req.ip, "tried to listApps ☠️", "", "");
      res
        .status(500)
        .send("Vous devez être connecté pour charger une application");
    }
  });
  //
  // GET /lispApps
  //
  ///////////////////////////////////////////////////////////////////////////////////////////



  /////////////////////////////////////////////////////////////////////////////////////////
  //
  // (7/7) POST /publish - For publishing an app with a unique ID
  //
  app.post('/publish', async (req, res) => {
    const userInfo = getUserInfo(req);
    const user = userInfo ? userInfo.name : null;
  
    if (user) {
      try {
        const { developer, name, code } = req.body; // data from the publish request
        const uniqueId = require('crypto').randomBytes(16).toString('hex'); // generate a unique ID for the app
  
        const appKeyPrefix = `published/${uniqueId}`;
        const appCodeKey = `${appKeyPrefix}/app.js`;
        const appDataKey = `${appKeyPrefix}/data.json`;
  
        // Prepare data to be saved with the app code
        const appData = {
          developer,
          name,
          uniqueId
        };
  
        // Save the code and app data to the database under the unique ID
        await db.set(appCodeKey, code);
        await db.set(appDataKey, JSON.stringify(appData));
  
        // Return the unique ID to the client
        res.json({ key: uniqueId });
      } catch (error) {
        console.error('Failed to publish the app:', error);
        res.status(500).send('Failed to publish the app.');
      }
    } else {
      formattedLog(req.ip, 'tried to PUBLISH ☠️', '', '');
      res.status(401).send('You must be logged in to publish an app.');
    }
  });
  //
  // POST /publish - For publishing an app with a unique ID
  //
  /////////////////////////////////////////////////////////////////////////////////////////


  /////////////////////////////////////////////////////////////////////////////////////////
  //
  // (8/7) POST /publish - For publishing an app with a unique ID
  //
  app.get('/getPublishedApp/:id', async (req, res) => {
    const uniqueId = req.params.id;
    const appKeyPrefix = `published/${uniqueId}`;
  
    // Assume the key for the app code is structured like so: 'published/{uniqueId}/app.js'
    const appCodeKey = `${appKeyPrefix}/app.js`;
  
    try {
      const appCode = await db.get(appCodeKey);
  
      if (appCode) {
        res.json({ code: appCode });
      } else {
        res.status(404).send('App not found.');
      }
    } catch (error) {
      console.error('Error retrieving the app code:', error);
      res.status(500).send('Internal server error.');
    }
  });
  //
  // (8/7) POST /publish - For publishing an app with a unique ID
  //
  /////////////////////////////////////////////////////////////////////////////////////////

  
  ///////////////////////////////////////////////////////////////////////////////////////////
  //
  // SERVER START
  //
  app.listen(port, () => {
    let now = new Date();
    now.setHours(now.getHours() + 1); // utc+1
    let formattedDate = now
      .toISOString()
      .replace("T", " ")
      .replace("Z", "")
      .substring(0, 16);

    log(
      `${formattedDate} <💫--------🤩--------🚀> --> Serveur 23fev 10h26 démarré sur le port ${port}`,
    );
  });
  //
  // SERVER START
  //
  ///////////////////////////////////////////////////////////////////////////////////////////
})();
