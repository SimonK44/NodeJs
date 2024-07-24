// Instancier l'application serveur
const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');

// Middleware pour autoriser express à recevoir des données en JSON dans le body
app.use(express.json());

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
    return res.json(articles);
});


// Route get vers 1 article par id
app.get('/article/:id', async (req, res) => {    
    const idParam = req.params.id;

    const foundArticle = await Article.findOne({ uid : idParam});

    if (!foundArticle) {
        return res.json({message : `L'article n'éxiste pas`});
    }
    return res.json(foundArticle);
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
    if (articleJSON.id != undefined || articleJSON.id) {
        
        //Essayer de trouver un article existant
        foundArticle = await Article.findOne({ uid : id });

        //Si je trouve l'article à modifier
        if (!foundArticle) {
            return res.json(`Impossible de modifier un article inexistant`)
        }
        foundArticle.title = articleJSON.title;
        foundArticle.content = articleJSON.content;
        foundArticle.author = articleJSON.author;

        // Sauvegarder en base
        await foundArticle.save();

        return res.json(`Article modifié avec succès`);
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

    return res.json(`Article créé avec succès`);
});


// Route delete pour supprimer un article par id
app.delete('/article/:id', async (req, res) => {

    //Récup indice converti en nombre
    const id = req.params.id;

    //Trouver un index
    const foundArticle = await Article.findOne({ uid : id });

    if (!foundArticle) {
        return res.json(`Article non trouvé`);
    }

    //Supprimer 1 élément
    await foundArticle.deleteOne();

    return res.json(`suppression article ${id}`);
});


// Ecoute du serveur
app.listen(3000, () => {
    console.log("Le serveur a démarré");
});






