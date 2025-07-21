const express = require('express');
const TrackPost = require('../models/TrackPost');
const protect = require('../middlewares/authMiddleware');
const Comment = require('../models/Comment');
const router = express.Router();

router.post('/', protect, async (req, res) => {
    const { spotifyId, title, artist, album, albumImageUrl, previewUrl, userName, userImageUrl } = req.body;
    const userId = req.userId;

    if (!spotifyId || !title || !artist || !album || !userName) {
        return res.status(400).json({ message: 'Les informations minimales (ID Spotify, titre, artiste, album, nom d\'utilisateur) sont requises.' });
    }

    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const userHasPostedToday = await TrackPost.findOne({
            userId: userId,
            postedAt: { $gte: twentyFourHoursAgo }
        });

        if (userHasPostedToday) {
            return res.status(403).json({ message: 'Vous avez déjà posté une musique dans les dernières 24 heures. Revenez demain !' });
        }

        const newPost = new TrackPost({
            spotifyId,
            title,
            artist,
            album,
            albumImageUrl,
            previewUrl,
            userId: userId,
            userName: userName,
            userImageUrl: userImageUrl
        });

        await newPost.save();
        res.status(201).json({ message: 'Musique postée avec succès !', post: newPost });

    } catch (error) {
        console.error('Erreur lors de la publication de la musique :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la publication de la musique.' });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userPosts = await TrackPost.find({ userId: userId }).sort({ postedAt: -1 });
        res.status(200).json(userPosts);
    } catch (error) {
        console.error('Erreur lors de la récupération des posts de l\'utilisateur :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des posts de l\'utilisateur.' });
    }
});

router.get('/feed', async (req, res) => {
    try {
        const feed = await TrackPost.find().sort({ postedAt: -1 });
        res.status(200).json(feed);
    } catch (error) {
        console.error('Erreur lors de la récupération du feed :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération du feed.' });
    }
});

router.post('/:id/like', protect, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;

        const post = await TrackPost.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post non trouvé.' });
        }

        if (post.likes.includes(userId)) {
            return res.status(400).json({ message: 'Vous avez déjà liké ce post.' });
        }

        post.likes.push(userId);
        await post.save();

        res.status(200).json({ message: 'Post liké avec succès !', likesCount: post.likes.length });

    } catch (error) {
        console.error('Erreur lors du like du post :', error);
        res.status(500).json({ message: 'Erreur serveur lors du like du post.' });
    }
});

router.post('/:id/unlike', protect, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;

        const post = await TrackPost.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post non trouvé.' });
        }

        if (!post.likes.includes(userId)) {
            return res.status(400).json({ message: 'Vous n\'avez pas liké ce post.' });
        }

        post.likes = post.likes.filter(id => id !== userId); // Retire l'ID de l'utilisateur du tableau des likes
        await post.save();

        res.status(200).json({ message: 'Post unliké avec succès !', likesCount: post.likes.length });

    } catch (error) {
        console.error('Erreur lors de l\'unlike du post :', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'unlike du post.' });
    }
});

router.post('/:id/comments', protect, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;
        const { text, userName, userImageUrl } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Le commentaire ne peut pas être vide.' });
        }
        if (!userName || !userImageUrl) {
            return res.status(400).json({ message: 'Informations utilisateur manquantes pour le commentaire.' });
        }

        const post = await TrackPost.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post non trouvé.' });
        }

        const newComment = new Comment({
            postId,
            userId,
            userName,
            userImageUrl,
            text
        });

        await newComment.save();
        res.status(201).json({ message: 'Commentaire ajouté avec succès !', comment: newComment });

    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire :', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du commentaire.' });
    }
});

router.get('/:id/comments', async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ postId: postId }).sort({ postedAt: -1 });
        res.status(200).json(comments);
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des commentaires.' });
    }
});

module.exports = router;