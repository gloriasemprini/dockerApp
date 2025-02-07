const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/dockerApp';

async function testDbConnection() {
    try {
        // Connessione al database
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connessione al database riuscita!');
    } catch (error) {
        console.error('Errore di connessione al database:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('Connessione al database chiusa.');
    }
}

testDbConnection();
