module.exports = {
    
    // Quand on exporte, une fonction "function" devient "maFonction : () => {}"
    /**
     * Fonction utilitaire pour retourner une structure de réponse métier 
     * @param {*} res 
     * @param {*} code 
     * @param {*} message 
     * @param {*} data 
     * @returns 
     */
    responseService : (res, code, message, data) => {
        return res.json({ code : code, message : message, data : data });
    }
}

