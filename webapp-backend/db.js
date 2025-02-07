const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/dockerApp';

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
});

mongoose.connection.on('connected', () => {
    console.log('Connesso a MongoDB su Windows, database:', mongoose.connection.db.databaseName);
});

mongoose.connection.on('error', (err) => {
    console.error('Errore di connessione a MongoDB:', err);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Connessione al database chiusa.');
    process.exit(0);
});


module.exports = mongoose;
