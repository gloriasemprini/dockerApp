const Docker = require('dockerode');
const docker = new Docker();

docker.ping((err, data) => {
    if (err) {
        console.error('Errore nel ping a Docker:', err);
    } else {
        console.log('Docker è online:', data.toString());
    }
});