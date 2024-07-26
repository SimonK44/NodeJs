// Instancier l'application serveur
const express = require('express');
const app = express();

// Middleware pour autoriser express à recevoir des données en JSON dans le body
app.use(express.json());

// Init la connection
const initMongoConnection = require('./mongoose/mongoose-config');
initMongoConnection();

//Routes
const articleRouter = require('./routes/article-routes');
app.use(articleRouter);

const authRouter = require('./routes/auth-routes');
app.use(authRouter);

// Démarrer le serveur
app.listen(3000, () => {
    console.log("Le serveur a démarré");
});






