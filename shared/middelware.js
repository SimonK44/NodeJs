const jwt = require('jsonwebtoken');

//Clé secrete
const JWT_SECRET = "cle_secrete";

module.exports = {

    // Middleware
    authMiddleware : (req, res, next) => {

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

}