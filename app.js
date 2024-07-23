// Instancier l'application serveur
const express = require('express');
const app = express();

// Ecoute du serveur
app.listen(3000, () => {
    console.log("Le serveur a démarré");
});

// Middleware pour autoriser express à recevoir des données en JSON dans le body
app.use(express.json());

// MOCK : Déclaration d'un tableau d'articles
let articles = [
    { id: 1, title: 'Premier article', content: 'Contenu du premier article', author: 'Isaac' },
    { id: 2, title: 'Deuxième article', content: 'Contenu du deuxième article', author: 'Sanchez' },
    { id: 3, title: 'Troisième article', content: 'Contenu du troisième article', author: 'Toto' }
];

// Route get vers tous les articles
app.get('/articles', (req, res) => {
    //Le .json parse directement les données
    return res.json(articles);
});

// Route get vers 1 article par id
app.get('/article/:id', (req, res) => {
    //Number = parseInt
    const id = Number(req.params.id);
    const article = articles.find(article => article.id === id);
    if (!article) {
        return res.status(404).send('Article non trouvé');
    }
    return res.json(article);
});

// Route post pour sauvegarder un nouvel article
app.post('/save-article', (req, res) => {

    //Récupérer l'article envoyé en json 
    const articleJSON = req.body;

    let foundArticle = null;

    //Est-ce qu'on a un id envoyer dans le json
    if (articleJSON.id != undefined || articleJSON) {
        //Essayer de trouver un article existant
        foundArticle = articles.find(article => article.id === articleJSON.id);
    }

    //Si je trouve je modifie les nouvelles
    if (foundArticle) {
        foundArticle.title = articleJSON.title;
        foundArticle.content = articleJSON.content;
        foundArticle.author = articleJSON.author;

        return res.json(`l'article a été modifié avec succès`);
    }

    //Sinon par défaut je crée
    articles.push(articleJSON);

    const id = articleJSON.id;

    return res.json(`L'article avec l'id ${id} à été créé avec succès`);
});

// Route delete pour supprimer un article par id
app.delete('/article/:id', (req, res) => {

    //Récup indice converti en nombre
    const id = Number(req.params.id);

    //Trouver l'index
    const indexArticle = articles.findIndex(article => article.id === id);

    if (indexArticle < 0) {
        return res.json(`Article non trouvé`);
    }

    //Supprimer 1 élément à partir de l'index
    articles.splice(indexArticle, 1);

    return res.send(`suppression article ${id}`);
});






