const mongoose = require('mongoose');

const connectDB = async () => {
    try {

        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.error('MONGODB_URI n\'est pas définie dans l\'environnement.');
            process.exit(1);
        }
        await mongoose.connect(MONGODB_URI);
        console.log('Connecté à MongoDB !');
    } catch (err) {
        console.error('Erreur de connexion à MongoDB :', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;