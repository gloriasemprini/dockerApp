const Group = require('../models/group');
const User = require('../models/user');

const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ message: 'Il nome del gruppo è obbligatorio.' });
        }

        const existingGroup = await Group.findOne({ name });
        if (existingGroup) {
            return res.status(400).json({ message: 'Un gruppo con questo nome esiste già.' });
        }

        const newGroup = new Group({
            name,
            admin: userId,
            users: [userId],
        });

        const savedGroup = await newGroup.save();

        const user = await User.findById(userId);
        if (user && !user.groups.includes(savedGroup._id)) {
            user.groups.push(savedGroup._id);
            await user.save();
        }

        return res.status(201).json(savedGroup);
    } catch (error) {
        console.error('Errore durante la creazione del gruppo:', error);
        return res.status(500).json({ message: 'Errore interno del server.' });
    }
};

const getGroupInfo = async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId).select('-_id -containers');
        res.status(200).json(group);
    } catch (error) {
        console.error('Errore nel recupero delle informazioni del gruppo:', error);
        return res.status(500).json({ message: 'Errore interno del server.' });
    }
};

const getGroupUsers = async (req, options = { excludeAdmin: false }) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId).populate('users');

        let users = group.users || [];

        if (options.excludeAdmin) {
            users = users.filter(user => user._id.toString() !== group.admin.toString());
        }

        return { status: 200, users };

    } catch (error) {
        return { status: 500, error: 'Errore nel recupero degli utenti del gruppo' };
    }
};

const leaveGroupAsMember = async (req) => {
    try {
        const { groupId } = req.params;
        const userId = req.body.userId;
        console.log(groupId);
        console.log(userId);

        const group = await Group.findById(groupId);
        const user = await User.findById(userId);

        if (!user) {
            return { status: 404, message: 'Utente non trovato' };
        }

        group.users = group.users.filter(id => id.toString() !== userId);
        user.groups = user.groups.filter(id => id.toString() !== groupId);

        await Promise.all([group.save(), user.save()]);

        return { status: 200, message: 'Utente è uscito dal gruppo con successo' };
    } catch (error) {
        console.error('Errore nel server:', error);
        return { status: 500, message: 'Errore nel server' };
    }
};

module.exports = {
    createGroup,
    getGroupInfo,
    getGroupUsers,
    leaveGroupAsMember,
};
