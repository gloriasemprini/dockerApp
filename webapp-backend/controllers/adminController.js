const Group = require('../models/group');
const User = require('../models/user');
const Container = require('../models/container');
const groupController = require('./groupController');
const Docker = require("dockerode");
const docker = new Docker();

const addUserToGroup = async ({ groupId, userId }) => {
    try {
        const group = await Group.findById(groupId);
        const user = await User.findById(userId);

        if (!user) {
            return {
                status: 404,
                message: 'Utente non trovato'
            };
        }

        group.users.push(userId);
        await group.save();

        user.groups.push(groupId);
        await user.save();

        return {
            status: 200,
            message: 'Utente aggiunto al gruppo con successo'
        };
    } catch (error) {
        console.error('Errore nel server:', error);
        return {
            status: 500,
            message: 'Errore nel server'
        };
    }
};

const removeUserFromGroup = async (req) => {
    try {
        console.log(req.body.userId);
        console.log(req.params.groupId);
        const { groupId } = req.params;
        const userId = req.body.userId;


        const group = await Group.findById(groupId);
        const user = await User.findById(userId);

        if (!user) {
            return {
                status: 404,
                message: 'Utente non trovato'
            };
        }

        group.users = group.users.filter(id => id.toString() !== userId);
        user.groups = user.groups.filter(id => id.toString() !== groupId);

        await Promise.all([group.save(), user.save()]);

        return {
            status: 200,
            message: 'Utente rimosso dal gruppo con successo'
        };
    } catch (error) {
        console.error('Errore nel server:', error);
        return {
            status: 500,
            message: 'Errore nel server'
        };
    }
};

const removeAdminAndHandleContainers = async (groupId, adminId) => {
    try {
        const group = await Group.findById(groupId).populate('users').populate('containers');

        if (group.users.length === 1) {
            console.log(`Amministratore rimosso, eliminando gruppo ${groupId}...`);

            const removeContainerPromises = group.containers.map(async (containerData) => {
                const container = docker.getContainer(containerData.dockerId);
                try {
                    const containerInfo = await container.inspect();
                    if (containerInfo?.State?.Running) {
                        await container.stop();
                    }
                    await container.remove();
                    await Container.deleteOne({ _id: containerData._id });
                } catch (err) {
                    console.warn(`Errore durante la gestione del container ${containerData.dockerId}:`, err.message);
                }
            });

            await Promise.all(removeContainerPromises);

            await Group.findByIdAndDelete(groupId);
            return {
                status: 200,
                message: 'Gruppo eliminato, non ci sono altri membri.'
            };

        } else {
            const remainingMembers = group.users.filter(user => user._id.toString() !== adminId);

            if (remainingMembers.length === 0) {
                return {
                    status: 400,
                    message: 'Non ci sono altri membri nel gruppo per promuovere un nuovo amministratore'
                };
            }

            const newAdmin = remainingMembers[0];
            await promoteAdmin(groupId, newAdmin);

            return {
                status: 200,
                message: 'Amministratore cambiato con successo.'
            };
        }
    } catch (error) {
        console.error('Errore:', error.message);
        return {
            status: 500,
            message: `Errore durante la gestione dell\'amministratore: ${error.message}`
        };
    }
};

const leaveGroupAsAdmin = async (groupId, adminId) => {
    try {
        const group = await Group.findById(groupId);

        if (group.users.length === 1) {
            return await removeAdminAndHandleContainers(groupId, adminId);
        } else {
            const newAdmin = group.users.find(user => user.toString() !== adminId);
            await promoteToAdmin(groupId, newAdmin);

            return await removeUserFromGroup({ groupId: groupId, userId: newAdmin });
        }
    } catch (error) {
        console.error(error);
        return {
            status: 500,
            message: 'Errore durante l\'uscita dell\'admin'
        };
    }
};



const promoteToAdmin = async (groupId, userId) => {
    try {
        console.log(userId);
        const group = await Group.findById(groupId);

        if (!group.users.includes(userId)) {
            return {
                status: 400,
                message: 'Utente non trovato nel gruppo'
            };
        }

        group.admin = userId;

        await group.save();
        return {
            status: 200,
            message: 'Amministratore cambiato con successo'
        };
    } catch (error) {
        return {
            status: 500,
            message: `Errore nel cambiare l'amministratore: ${error.message}`
        };
    }
};

const availableUsers = async (req) => {
    const { groupId } = req.params;

    try {
        const availableUsers = await User.find({ groups: { $ne: groupId } });
        return {
            status: 200,
            users: availableUsers || []
        };
    } catch (error) {
        return {
            status: 500,
            error: 'Errore nel recupero degli utenti'
        };
    }
}

const getRemovableGroupUsers = async (req) => {
    return await groupController.getGroupUsers(req, { excludeAdmin: true });
};

const updateGroup = async (groupId, adminId, updateData) => {
    const group = await Group.findById(groupId);

    Object.assign(group, updateData);
    await group.save();

    return group;
};

module.exports = {
    addUserToGroup,
    getRemovableGroupUsers,
    removeUserFromGroup,
    promoteToAdmin,
    removeAdminAndHandleContainers,
    availableUsers,
    updateGroup,
    leaveGroupAsAdmin,
}