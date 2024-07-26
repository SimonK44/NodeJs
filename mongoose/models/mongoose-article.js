// Importer Mongoose
const mongoose = require('mongoose');

// Déclaration du modele Article
const Article = mongoose.model('Article', { 
            uid: String, 
            title : String, 
            content : String, 
            author : String }, 'articles');

//Export de la classe/model Article
module.exports = Article;