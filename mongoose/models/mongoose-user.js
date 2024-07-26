// Importer Mongoose
const mongoose = require('mongoose');

// Déclaration du modele User
const User = mongoose.model('User', { 
            email : String, 
            password : String }, 'users');

//Export de la classe/model User
module.exports = User;