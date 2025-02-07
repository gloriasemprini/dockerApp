const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Group = require('../models/group');

const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * Genera un token JWT.
 */
const generateToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
    };

    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
};

/**
 * Verifica se un token è valido.
 */
const verifyJWT = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
};

/**
 * Middleware di autenticazione.
 * Controlla se l'utente ha un token valido nella request.
 */
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token mancante o non valido.' });
    }

    try {
        const decoded = verifyJWT(token);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Utente non autorizzato.' });
        }

        req.user = { id: user._id, username: user.username };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token non valido.' });
    }
};

const checkGroupExists = async (req, res, next) => {
    const groupId = req.params.groupId || req.body.groupId;
    if (!groupId) {
        return res.status(400).json({ message: 'groupId mancante nella richiesta' });
    }

    try {
        // Trova il gruppo
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: `Gruppo con ID ${groupId} non trovato.` });
        }

        req.group = group; // Aggiungi il gruppo alla richiesta per usarlo nei middleware successivi
        next(); // Passa al prossimo middleware o rotta
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la verifica del gruppo', error: error.message });
    }
};


/**
 * Middleware per controllare l'appartenenza dell'utente al gruppo.
 * Verifica se l'utente è membro del gruppo.
 */
const checkGroupMembership = async (req, res, next) => {
    const group = req.group;
    if (!group.users.includes(req.user.id)) {
        return res.status(403).json({ message: 'Non sei membro di questo gruppo' });
    }

    next();
};

/**
 * Middleware per controllare il ruolo di amministratore nel gruppo.
 * Verifica se l'utente è un amministratore del gruppo.
 */
const checkAdminRole = async (req, res, next) => {
    const group = req.group;
    if (group.admin.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Non sei amministratore di questo gruppo' });
    }

    next();
};

module.exports = {
    generateToken,
    verifyJWT,
    authenticate,
    checkGroupMembership,
    checkAdminRole,
    checkGroupExists,
};
