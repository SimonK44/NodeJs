// Instancier l'application serveur
const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const cors = require('cors');

//Clé secrete
const JWT_SECRET = "cle_secrete";

// Middleware pour autoriser express à recevoir des données en JSON dans le body
app.use(express.json());
app.use(cors());

/**
 * Fonction utilitaire pour retourner une structure de réponse métier 
 * @param {*} res 
 * @param {*} code 
 * @param {*} message 
 * @param {*} data 
 * @returns 
 */
function responseService(res, code, message, data) {
    return res.json({ code : code, message : message, data : data });
};


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
const User = mongoose.model('User', { email : String, password : String }, 'users');

//------------------------BDD------------------------//

// Middleware
function authMiddleware(req, res, next) {

    // Si token null alors erreur
    if (req.headers.authorization == undefined || !req.headers.authorization) {
        return res.json({ message: "Token null" });
    }

    // Extraire le token (qui est bearer)
    const token = req.headers.authorization.substring(7);

    // par defaut le result est null
    let result = null;

    // Si reussi à générer le token sans crash
    try {
        result = jwt.verify(token, JWT_SECRET);
    } catch {
    }

    // Si result null donc token incorrect
    if (!result) {
        return res.json({ message: "token pas bon" });
    }

    //On passe le Middleware
    return next();
}

// Route get vers tous les articles
app.get('/articles', async (req, res) => {
    const articles = await Article.find();
    return responseService(res, '200', 'La liste des articles a été récupérés avec succès', articles);
});


// Route get vers 1 article par id
app.get('/article/:id', async (req, res) => { 
    //Récupérer l'id de la requête   
    const idParam = req.params.id;

    const foundArticle = await Article.findOne({ uid : idParam});

    if (!foundArticle) {
        return responseService(res, '702', `Impossible de récupérer un article avec l'UID ${idParam}`, null);
    }
    return responseService(res, '200', 'Article récupéré avec succès', foundArticle);
});


// Route post pour sauvegarder un nouvel article
app.post('/save-article', authMiddleware, async (req, res) => {
      
    //Récupérer l'article envoyé en json 
    const articleJSON = req.body;

    let foundArticle = null;
    //-------------------------
    // EDITION
    //-------------------------
    //Est-ce qu'on a un id envoyer dans le json
    if (articleJSON.uid != undefined || articleJSON.uid) {
        // Si le titre existe déjà
        const articleByTitle = await Article.findOne({ title : articleJSON.title, uid : { $ne : articleJSON.uid} });
        if(articleByTitle) {
            return responseService(res, '701', 'Impossible de modifier un article avec un titre déjà existant', null);
        }
        
        //Essayer de trouver un article existant
        foundArticle = await Article.findOne({ uid : articleJSON.uid });
        //Si je ne trouve pas l'article à modifier
        if (!foundArticle) {
            return responseService(res, '701', 'Impossible de modifier un article inexistant', null);
        }
        foundArticle.title = articleJSON.title;
        foundArticle.content = articleJSON.content;
        foundArticle.author = articleJSON.author;

        // Sauvegarder en base
        await foundArticle.save();

        return responseService(res, '200', 'Article modifié avec succès', foundArticle);
    }

    // Tester que le titre n'éxiste pas en base
    const articleByTitle = await Article.findOne({ title : articleJSON.title });
    if(articleByTitle) {
        return responseService(res, '701', 'Impossible d\'ajouter un article avec un titre déjà existant', null);
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
app.delete('/article/:id', authMiddleware, async (req, res) => {

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


app.post('/auth', async (req, res) => {

    //Tester le couple email / mdp
    const loggedUser = await User.findOne({ email : req.body.email, password : req.body.password});

    //Si mauvais
    if (!loggedUser) {
        return responseService(res, '701', `Couple email/password incorrect`, null);
    }

    //Se connecter (génerer un token)
    const token = jwt.sign({ email : loggedUser.email }, JWT_SECRET, { expiresIn : '3 hours' });
 
    // Retourner la réponse json
    return responseService(res, '202', `Connecté avec succès`, token);
});


// Ecoute du serveur
app.listen(3000, () => {
    console.log("Le serveur a démarré");
});






