const Docker = require('dockerode');
const docker = new Docker();
const Container = require('../models/container');
const Group = require('../models/group');
const { sendNotification } = require('../utils/wsUtils');
const notificationService = require('../services/notificationService');

exports.createContainer = async (req) => {
    try {
        const groupId = req.body.groupId;
        const portMapping = req.body.portMapping || '8080';
        const imageName = req.body.imageName;

        const group = await Group.findById(groupId);  // Trova il gruppo usando il groupId

        const images = await docker.listImages();
        const imageExists = images.some(image =>
            image.RepoTags?.includes(imageName)
        );

        if (!imageExists) {
            await new Promise((resolve, reject) => {
                docker.pull(imageName, (err, stream) => {
                    if (err) return reject(err);
                    docker.modem.followProgress(stream, onFinished, onProgress);
                    function onFinished(err) {
                        if (err) return reject(err);
                        sendNotification({
                            type: 'info',
                            message: `Immagine ${imageName} scaricata con successo.`,
                        });
                        resolve();
                    }
                    function onProgress(event) {
                        sendNotification({
                            type: 'progress',
                            message: `Scaricamento immagine in corso: ${JSON.stringify(event)}`,
                        });
                        console.log(event);
                    }
                });
            });
            console.log(`Immagine ${imageName} scaricata con successo.`);
        } else {
            console.log(`Immagine ${imageName} già presente.`);
        }

        const container = await docker.createContainer({
            Image: imageName,
            HostConfig: {
                PortBindings: {
                    '80/tcp': [{ HostPort: portMapping }],
                },
            },
        });

        await container.start();
        const containerId = container.id;
        const generatedName = `container-${containerId}`;
        const savedContainer = await Container.create({
            dockerId: container.id,
            name: generatedName,
            group: groupId,
            image: imageName,
        });

        group.containers.push(savedContainer._id);
        await group.save()

        sendNotification({
            type: 'container-created',
            message: `Container ${containerId} creato e avviato con successo.`
        });

        notificationService.emit('containerevent', {
            event: 'create',
            containerId,
            message: `Container ${containerId} creato e avviato con successo.`,
        });

        return {
            status: 200,
            message: 'Container creato e avviato con successo',
            container: savedContainer
        };

    } catch (error) {
        console.error('Errore nel creare o avviare il container:', error);

        sendNotification({
            type: 'error',
            message: 'Errore nella creazione del container',
            error: error.message
        });

        return {
            status: 500,
            message: 'Errore nel creare o avviare il container',
            error: error.message || error
        };
    }
};

exports.stopContainer = async (req) => {
    const { containerId } = req.body;

    try {
        const container = docker.getContainer(containerId);
        await container.stop();

        notificationService.emit('containerevent', {
            event: 'stop',
            containerId,
            message: `Container ${containerId} fermato con successo.`,
        });

        sendNotification({
            type: 'container-stopped',
            message: `Container ${containerId} fermato con successo.`
        });

        return {
            status: 200,
            message: 'Container fermato con successo',
            container: containerId,
        };
    } catch (error) {
        console.error('Errore nel fermare il container:', error);

        sendNotification({ type: 'error', message: `Errore nel fermare il container ${containerId}`, error: error.message });

        return {
            status: 500,
            message: 'Errore nel fermare il container',
            error: error.message || error,
        };
    }
};

exports.startContainer = async (req) => {
    const { containerId } = req.body;

    try {
        const container = docker.getContainer(containerId);
        await container.start();

        sendNotification({
            type: 'container-started',
            message: `Container ${containerId} avviato con successo.`
        });

        notificationService.emit('containerevent', {
            event: 'start',
            containerId,
            message: `Container ${containerId} avviato con successo.`,
        });

        return {
            status: 200,
            message: 'Container avviato con successo',
            container: containerId,
        };
    } catch (error) {
        console.error('Errore nell\'avviare il container:', error);

        sendNotification({ type: 'error', message: `Errore nell'avviare il container ${containerId}`, error: error.message });

        return {
            status: 500,
            message: 'Errore nell\'avviare il container',
            error: error.message || error,
        };
    }
};

exports.getGroupContainers = async (req) => {
    try {
        const groupId = req.params.groupId;
        const group = await Group.findById(groupId).populate('containers');
        const dockerContainers = await docker.listContainers({ all: true });

        const groupContainerIds = group.containers.map(container => container.dockerId);

        const filteredContainers = dockerContainers.filter(dockerContainer =>
            groupContainerIds.includes(dockerContainer.Id)
        ).map(dockerContainer => ({
            dockerId: dockerContainer.Id,
            name: dockerContainer.Names[0],
            status: dockerContainer.State,
            image: dockerContainer.Image
        }));

        return { status: 200, containers: filteredContainers };

    } catch (error) {
        console.error('Errore nel recupero dei container del gruppo backend:', error);
        return { status: 500, message: 'Errore interno del server.' };
    }
};

exports.deleteImage = async (req) => {
    try {
        const groupId = req.params.groupId;
        const imageName = req.body.imageName;

        const containersUsingImage = await Container.find({ group: groupId, image: imageName });
        if (containersUsingImage.length === 0) {
            return { status: 404, message: 'Nessun container trovato con questa immagine.' };
        }

        const removeContainerPromises = containersUsingImage.map(async (containerData) => {
            const container = docker.getContainer(containerData.dockerId);
            try {
                const containerInfo = await container.inspect();
                if (containerInfo && containerInfo.State && containerInfo.State.Running) {
                    await container.stop();
                }
                await container.remove();
                await Container.deleteOne({ _id: containerData._id });
                await Group.updateOne({ _id: groupId }, { $pull: { containers: containerData._id }});
            } catch (err) {
                console.warn(`Errore durante la gestione del container ${containerData.dockerId}:`, err.message);
                sendNotification({
                    type: 'error',
                    message: `Errore nel rimuovere il container ${containerData.dockerId}`,
                    error: err.message
                });            }
        });

        await Promise.all(removeContainerPromises);

        const image = docker.getImage(imageName);
        await image.remove();

        sendNotification({
            type: 'image-deleted',
            message: `Immagine ${imageName} e relativi container eliminati correttamente.`
        });

        notificationService.emit('containerevent', {
            event: 'deleteImage',
            message: `Immagine ${imageName} e relativi container eliminati correttamente.`,
        });

        return { status: 200, message: `Immagine ${imageName} e relativi container eliminati correttamente.` };
    } catch (error) {
        console.error("Errore durante l'eliminazione:", error.message);

        sendNotification({
            type: 'error',
            message: `Errore durante l'eliminazione dell'immagine ${req.body.imageName}`,
            error: error.message
        });

        return { status: 500, error: error.message };
    }
};
