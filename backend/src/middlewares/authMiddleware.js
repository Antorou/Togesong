const { Clerk } = require('@clerk/clerk-sdk-node');

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Accès non autorisé. Pas de token fourni.' });
        }

        const token = authHeader.split(' ')[1];

        const client = await clerk.verifyToken(token);

        if (!client) {
            return res.status(401).json({ message: 'Token invalide ou expiré.' });
        }

        req.userId = client.sub;
        next();
    } catch (error) {
        console.error('Erreur d\'authentification Clerk :', error.message);
        if (error.message.includes('No secret key found')) {
            return res.status(500).json({ message: 'Erreur serveur: Clé secrète Clerk non configurée.' });
        }
        res.status(401).json({ message: 'Accès non autorisé.' });
    }
};

module.exports = protect;