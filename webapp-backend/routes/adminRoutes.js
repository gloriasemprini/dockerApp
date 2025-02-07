const express = require('express');
const { checkAdminRole, authenticate, checkGroupMembership, checkGroupExists } = require("../utils/jwtUtils");
const router = express.Router();
const containerController = require("../controllers/containerController");
const adminController = require("../controllers/adminController");

router.get('/:groupId/available-users', authenticate, checkGroupExists, checkGroupMembership, checkAdminRole, async (req, res) => {
    try {
        const availableUsers = await adminController.availableUsers(req);
        res.status(200).json(availableUsers.users);
    } catch (error) {
        res.status(500).json({ error: 'Errore nel recupero degli utenti' });
    }
});

router.post('/:groupId/inviteUser', authenticate, checkGroupExists, checkGroupMembership, checkAdminRole, async (req, res) => {
    const groupId = req.params.groupId;
    const { userId } = req.body;

    try {
        const result = await adminController.addUserToGroup({ groupId, userId });
        return res.status(result.status).json({ message: result.message });
    } catch (error) {
        console.error('Errore nell\'invito dell\'utente:', error);
        return res.status(500).json({ error: 'Errore nell\'invito dell\'utente' });
    }
});

router.put('/:groupId/change-admin', authenticate, checkGroupExists, checkGroupMembership, checkAdminRole, async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const adminId = req.body.userId;
        const result = await adminController.promoteToAdmin(groupId, adminId);
        if (result.status === 200) {
            return res.status(200).json({ message: result.message });
        } else {
            return res.status(result.status).json({ error: result.error });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Errore nel promuovere l\'utente a admin' });
    }
});

router.delete('/:groupId/removeUser', authenticate, checkGroupExists, checkGroupMembership, checkAdminRole, async (req, res) => {
    try {
        const result = await adminController.removeUserFromGroup(req);
        return res.status(result.status).json({ message: result.message });
    } catch (error) {
        console.error('Errore nella rimozione dell\'utente:', error);
        return res.status(500).json({ error: 'Errore nella rimozione dell\'utente' });
    }
});

router.post('/:groupId/create-container', authenticate, checkGroupExists, checkGroupMembership, checkAdminRole, async (req, res) => {
    try {
        req.body.groupId = req.params.groupId;
        const result = await containerController.createContainer(req);

        if (result.status === 200) {
            return res.status(200).json({ message: result.message, container: result.container });
        } else if (result.status === 404) {
            return res.status(404).json({ message: result.message });
        } else {
            return res.status(500).json({ message: result.message, error: result.error });
        }
    } catch (error) {
        console.error('Errore nella creazione del container create:', error);
        return res.status(500).json({ message: 'Errore nella creazione del container.' });
    }
});

router.delete('/:groupId/delete-image', authenticate, checkGroupExists, checkGroupMembership, checkAdminRole, async (req, res) => {
    try {
        const result = await containerController.deleteImage(req, res);
        if (result.statusCode) {
            return res.status(result.statusCode).json(result);
        } else {
            return res.status(500).json({ error: 'Errore sconosciuto' });
        }
    } catch (error) {
        console.error('Errore nella route delete-image:', error);
        return res.status(500).json({ message: 'Errore nella route delete-image', error: error.message || error });
    }
});

router.delete('/:groupId/delete-group', authenticate, checkGroupExists, checkGroupMembership, checkAdminRole, async (req, res) => {
    try {
        const { groupId } = req.params;
        const adminId = req.user._id;

        const result = await adminController.removeAdminAndHandleContainers(groupId, adminId);

        res.status(200).json(result);
    } catch (error) {
        console.error(`Errore nella rimozione dell'amministratore: ${error.message}`);
        res.status(500).json({ message: `Errore: ${error.message}` });
    }
});

router.get('/:groupId/is-admin', authenticate, checkGroupExists, async (req, res) => {
    try {
        const group = req.group;
        const isAdmin = group.admin.toString() === req.user.id.toString();

        // Rispondi con un semplice valore booleano
        res.status(200).json({ isAdmin });
    } catch (error) {
        res.status(500).json({ error: 'Errore nel determinare il ruolo dell\'utente nel gruppo' });
    }
});

router.delete('/:groupId/leave-group', authenticate, checkGroupExists, checkGroupMembership, checkAdminRole, async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const adminId = req.body.userId;
        const result = await adminController.leaveGroupAsAdmin(groupId, adminId);
        return res.status(result.status).json({ message: result.message });
    } catch (error) {
        console.error('Errore durante l\'uscita dell\'admin dal gruppo:', error);
        return res.status(500).json({ error: 'Errore durante l\'uscita dal gruppo' });
    }
});


module.exports = router;