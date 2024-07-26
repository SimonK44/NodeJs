const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Article = require('../mongoose/models/mongoose-article');
const helpers = require('../shared/helpers');
const middlewares = require('../shared/middelware');

// Route get vers tous les articles
router.get('/articles', async (req, res) => {
    const articles = await Article.find();
    return helpers.responseService(res, '200', 'La liste des articles a été récupérés avec succès', articles);
});

// Route get vers 1 article par id
router.get('/article/:id', async (req, res) => { 
    //Récupérer l'id de la requête   
    const idParam = req.params.id;

    const foundArticle = await Article.findOne({ uid : idParam});

    if (!foundArticle) {
        return helpers.responseService(res, '702', `Impossible de récupérer un article avec l'UID ${idParam}`, null);
    }
    return helpers.responseService(res, '200', 'Article récupéré avec succès', foundArticle);
});

// Route post pour sauvegarder un nouvel article
router.post('/save-article', middlewares.authMiddleware, async (req, res) => {
      
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
            return helpers.responseService(res, '701', 'Impossible de modifier un article avec un titre déjà existant', null);
        }
        
        //Essayer de trouver un article existant
        foundArticle = await Article.findOne({ uid : articleJSON.uid });
        //Si je ne trouve pas l'article à modifier
        if (!foundArticle) {
            return helpers.responseService(res, '701', 'Impossible de modifier un article inexistant', null);
        }
        foundArticle.title = articleJSON.title;
        foundArticle.content = articleJSON.content;
        foundArticle.author = articleJSON.author;

        // Sauvegarder en base
        await foundArticle.save();

        return helpers.responseService(res, '200', 'Article modifié avec succès', foundArticle);
    }

    // Tester que le titre n'éxiste pas en base
    const articleByTitle = await Article.findOne({ title : articleJSON.title });
    if(articleByTitle) {
        return helpers.responseService(res, '701', 'Impossible d\'ajouter un article avec un titre déjà existant', null);
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

    return helpers.responseService(res, '200', 'Article ajouté avec succès', createdArticle);
});

// Route delete pour supprimer un article par id
router.delete('/article/:id', middlewares.authMiddleware, async (req, res) => {

    //Récup indice converti en nombre
    const id = req.params.id;

    //Trouver un index
    const foundArticle = await Article.findOne({ uid : id });

    if (!foundArticle) {
        return helpers.responseService(res, '702', 'Impossible de supprimer un article dont l\'UID n\'existe pas', null);
    }

    //Supprimer 1 élément
    await foundArticle.deleteOne();

    return helpers.responseService(res, '200', `L'article ${id} a été supprimé avec succès`, foundArticle);
});

//Exporter le router
module.exports = router;
