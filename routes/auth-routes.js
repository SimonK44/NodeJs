const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../mongoose/models/mongoose-user');
const helpers = require('../shared/helpers');
const middlewares = require('../shared/middelware');

//Clé secrete
const JWT_SECRET = "cle_secrete";

router.post('/auth', async (req, res) => {

    //Tester le couple email / mdp
    const loggedUser = await User.findOne({ email : req.body.email, password : req.body.password});

    //Si mauvais
    if (!loggedUser) {
        return helpers.responseService(res, '701', `Couple email/password incorrect`, null);
    }

    //Se connecter (génerer un token)
    const token = jwt.sign({ email : loggedUser.email }, JWT_SECRET, { expiresIn : '3 hours' });
 
    // Retourner la réponse json
    return helpers.responseService(res, '202', `Connecté avec succès`, token);
});

//Exporter le router
module.exports = router;