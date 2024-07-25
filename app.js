// Instancier l'application serveur
const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');

// Middleware pour autoriser express à recevoir des données en JSON dans le body
app.use(express.json());

function responseService(res, code, message, data) {
    return res.json({ code : code, message : message, data : data});
}

//------------------------BDD------------------------//

// Importer Mongoose
const mongoose = require('mongoose');

// Ecouter quand la connexion success
mongoose.connection.once('open', () => {
        console.log(`Connecté à la bdd`)
});

// Ecouter quand la connexion plante
mongoose.connection.on('error', (err) => {
    console.log(`Erreur de bdd : ${err}`);
});

// Se connecter à mongo db
mongoose.connect("mongodb://localhost:27017/db_article")

// Déclaration du modele
const Article = mongoose.model('Article', { uid: String, title : String, content : String, author : String }, 'articles');

//------------------------BDD------------------------//


// Route get vers tous les articles
app.get('/articles', async (req, res) => {
    const articles = await Article.find();
    return responseService(res, '200', 'La liste des articles a été récupérés avec succès', articles);
});


// Route get vers 1 article par id
app.get('/article/:id', async (req, res) => {    
    const idParam = req.params.id;

    const foundArticle = await Article.findOne({ uid : idParam});

    if (!foundArticle) {
        return responseService(res, '702', `Impossible de récupérer un article avec l'UID ${idParam}`, null);
    }
    return responseService(res, '200', 'Article récupéré avec succès', foundArticle);
});


// Route post pour sauvegarder un nouvel article
app.post('/save-article', async (req, res) => {

    //Récupérer l'article envoyé en json 
    const articleJSON = req.body;

    let foundArticle = null;
    //-------------------------
    // EDITION
    //-------------------------
    //Est-ce qu'on a un id envoyer dans le json
    if (articleJSON.uid != undefined || articleJSON.uid) {
        
        //Essayer de trouver un article existant
        foundArticle = await Article.findOne({ uid : articleJSON.uid });
        //Si je ne trouve pas l'article à modifier
        if (!foundArticle) {
            return responseService(res, '701', 'Impossible d\'ajouter un article avec un titre déjà existant', null);
        }
        foundArticle.title = articleJSON.title;
        foundArticle.content = articleJSON.content;
        foundArticle.author = articleJSON.author;

        // Sauvegarder en base
        await foundArticle.save();

        return responseService(res, '200', 'Article modifié avec succès', foundArticle);
    }

    //-------------------------
    // CREATION
    //-------------------------
    //Instancier un article Mongo
    const createdArticle = await Article.create(articleJSON);  

    //Générer l'ID
    createdArticle.uid = uuidv4();

    //Sauvegarder en base
    await createdArticle.save();

    return responseService(res, '200', 'Article ajouté avec succès', createdArticle);
});


// Route delete pour supprimer un article par id
app.delete('/article/:id', async (req, res) => {

    //Récup indice converti en nombre
    const id = req.params.id;

    //Trouver un index
    const foundArticle = await Article.findOne({ uid : id });

    if (!foundArticle) {
        return responseService(res, '702', 'Impossible de supprimer un article dont l\'UID n\'existe pas', null);
    }

    //Supprimer 1 élément
    await foundArticle.deleteOne();

    return responseService(res, '200', `L'article ${id} a été supprimé avec succès`, foundArticle);
});


// Ecoute du serveur
app.listen(3000, () => {
    console.log("Le serveur a démarré");
});






