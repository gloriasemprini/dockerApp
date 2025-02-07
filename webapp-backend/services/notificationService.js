const EventEmitter = require('events');
class NotificationService extends EventEmitter {}
const notificationService = new NotificationService();
const { sendNotification } = require('../utils/wsUtils')

setInterval(() => {
    const message = { event: 'Nuovo evento', message: 'C\'è una nuova notifica!' };
    sendNotification(message);
}, 5000);

module.exports = notificationService;