const express = require('express');
const groupController = require('../controllers/groupController');
const { authenticate, checkGroupMembership, checkGroupExists } = require("../utils/jwtUtils");
const router = express.Router();
const userController = require('../controllers/userController');
const containerController = require("../controllers/containerController");

router.post('/create', authenticate, groupController.createGroup);

router.get('/:groupId/group-users', authenticate, checkGroupExists, checkGroupMembership, async (req, res) => {
    const result = await groupController.getGroupUsers(req);
    if (result.status === 200) {
        res.status(200).json(result.users);
    } else {
        res.status(result.status).json({ error: result.error });
    }
});

router.get('/user-groups', authenticate, async (req, res) => {
    try {
        const userGroups = await userController.getUserGroups(req);
        if (userGroups.status === 200) {
            return res.status(200).json(userGroups.groups);
        } else if (userGroups.status === 404) {
            return res.status(404).json({ message: userGroups.message });
        } else {
            return res.status(500).json({ message: userGroups.message });
        }
    } catch (error) {
        console.error('Errore nel recupero dei gruppi:', error);
        return res.status(500).json({ message: 'Errore nel recupero dei gruppi.' });
    }
});

router.get('/:groupId/list-container', authenticate, checkGroupExists, checkGroupMembership, async (req, res) => {
    try {
        const groupContainers = await containerController.getGroupContainers(req);
        if (groupContainers.status === 200) {
            return res.status(200).json(groupContainers.containers);
        } else if (groupContainers.status === 404) {
            return res.status(404).json({ message: groupContainers.message });
        } else {
            return res.status(500).json({ message: groupContainers.message });
        }
    } catch (error) {
        console.error('Errore nel recupero dei container del gruppo:', error);
        return res.status(500).json({ message: 'Errore nel recupero dei container del gruppo.' });
    }
});

router.post('/:groupId/stop-container', authenticate, checkGroupExists, checkGroupMembership, async (req, res) => {
    try {
        const result = await containerController.stopContainer(req, res);

        if (result.status === 200) {
            return res.status(200).json({ message: result.message, container: result.container });
        } else {
            return res.status(result.status).json({ message: result.message, error: result.error });
        }
    } catch (error) {
        console.error('Errore nella route stop-container:', error);
        return res.status(500).json({
            message: 'Errore nella route stop-container',
            error: error.message || error,
        });
    }
});

router.post('/:groupId/start-container', authenticate, checkGroupExists, checkGroupMembership, async (req, res) => {
    try {
        const result = await containerController.startContainer(req, res);

        if (result.status === 200) {
            return res.status(200).json({ message: result.message, container: result.container });
        } else {
            return res.status(result.status).json({ message: result.message, error: result.error });
        }
    } catch (error) {
        console.error('Errore nella route start-container:', error);
        return res.status(500).json({
            message: 'Errore nella route start-container',
            error: error.message || error,
        });
    }
});

router.delete('/:groupId/leave', authenticate, checkGroupExists, checkGroupMembership, async (req, res) => {
    try {
        const result = await groupController.leaveGroupAsMember(req);
        return res.status(result.status).json({ message: result.message });
    } catch (error) {
        console.error('Errore durante l\'uscita dal gruppo:', error);
        return res.status(500).json({ error: 'Errore durante l\'uscita dal gruppo' });
    }
});


router.get('/:groupId/info', authenticate, checkGroupExists, checkGroupMembership, groupController.getGroupInfo);

module.exports = router;
