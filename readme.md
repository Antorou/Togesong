
# Togesong - Le BeReal Musical 

## Table des matières

1. [À Propos](#1-à-propos)
2. [Fonctionnalités](#2-fonctionnalités)
3. [Technologies Utilisées](#3-technologies-utilisées)
4. [Prérequis](#4-prérequis)
5. [Lancement avec Docker Compose](#5-lancement-avec-docker-compose)
6. [Structure du Projet](#6-structure-du-projet)
7. [Développement](#7-développement)
8. [Prochaines Étapes](#8-prochaines-étapes)
9. [Licence](#9-licence)

-----

## 1\. À Propos

Togesong est une application web inspirée du concept de BeReal, mais centrée sur le partage de musique. Chaque jour, les utilisateurs peuvent poster une seule musique de leur choix via l'API Spotify. Cette musique est ensuite visible sur un "feed" principal pour une durée limitée de 24 heures. L'application intègre des fonctionnalités sociales telles que les profils utilisateurs, les likes et les commentaires.

Ce projet est conçu avec une architecture moderne utilisant le stack MERN (MongoDB, Express.js, React.js, Node.js) et est entièrement conteneurisé avec Docker pour faciliter le développement, l'isolation des services et le déploiement.

## 2\. Fonctionnalités

  * **Publication Quotidienne Unique :** Chaque utilisateur peut poster une seule musique par période de 24 heures.
  * **Recherche Spotify :** Recherchez et sélectionnez des musiques directement via l'intégration de l'API Spotify.
  * **Feed de 24h :** Visualisez les musiques postées par tous les utilisateurs, qui expirent automatiquement après 24 heures.
  * **Authentification Utilisateur :** Inscription et connexion sécurisées via Clerk.
  * **Profils Utilisateur :** Chaque utilisateur a une page de profil affichant ses détails (nom, photo) et l'historique de ses musiques partagées.
  * **Likes :** Aimez les musiques postées par d'autres utilisateurs.
  * **Commentaires :** Laissez des commentaires sous les musiques du feed.
  * **Prévisualisation Audio :** Écoutez un extrait de 30 secondes des musiques (si disponible via l'API Spotify).

## 3\. Technologies Utilisées

  * **Backend :**
      * Node.js
      * Express.js
      * Mongoose (ODM pour MongoDB)
      * `cors`
      * `dotenv`
      * `@clerk/clerk-sdk-node` (SDK Backend pour l'authentification Clerk)
      * Nodemon
  * **Frontend :**
      * React.js
      * Vite
      * React Route
      * `@clerk/clerk-react` (SDK Frontend pour l'authentification Clerk)
  * **Base de données :**
      * MongoDB
  * **Conteneurisation :**
      * Docker
      * Docker Compose

## 4\. Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine :

  * **Docker Desktop :** Inclut Docker Engine et Docker Compose.
  * **Node.js et npm**
  * **Comptes API :**
      * **Spotify for Developers :** Pour accéder à l'API musicale.
          * Créez une application et récupérez votre `Client ID` et `Client Secret`.
      * **Clerk :** Pour la gestion de l'authentification utilisateur.
          * Créez une application et récupérez votre `Publishable Key` et `Secret Key`.
          * Configurez un modèle JWT nommé `long_lived` dans les "JWT Templates" de votre tableau de bord Clerk (sous "Developers").


## 5. Lancement avec Docker Compose

Assurez-vous que Docker Desktop est en cours d'exécution. Naviguez à la racine de votre projet (`Togesong/`) dans votre terminal et exécutez :

```bash
docker-compose up --build -d
```

  * `--build` : Force la reconstruction des images Docker (nécessaire lors du premier lancement ou après des modifications dans les Dockerfiles ou `package.json`).
  * `-d` : Lance les conteneurs en arrière-plan (mode "detached").

Le premier lancement peut prendre un certain temps car Docker doit télécharger les images et construire les vôtres.

### Accéder à l'application

Une fois les conteneurs démarrés :

  * **Frontend (React) :** Accédez à l'application dans votre navigateur à l'adresse `http://localhost:3000/`.
  * **Backend (Node.js API) :** L'API est accessible sur `http://localhost:5000/api`. Par exemple, pour tester la recherche Spotify : `http://localhost:5000/api/spotify/search?q=Bohemian%20Rhapsody`.

## 6\. Structure du Projet

```
Togesong/
├── .env                  
├── .gitignore            
├── docker-compose.yml    
├── backend/
│   ├── Dockerfile       
│   ├── package.json      
│   ├── src/
│   │   ├── app.js        
│   │   ├── server.js    
│   │   ├── config/       
│   │   │   └── db.js     
│   │   ├── middleware/
│   │   │   └── authMiddleware.js 
│   │   ├── models/
│   │   │   ├── TrackPost.js
│   │   │   └── Comment.js
│   │   ├── routes/       
│   │   │   ├── postRoutes.js
│   │   │   └── spotifyRoutes.js
│   │   └── utils/
│   │       └── spotifyAuth.js
├── frontend/             
│   ├── Dockerfile.dev   
│   ├── package.json      
│   ├── public/ 
│   ├── src/
│   │   ├── App.jsx      
│   │   ├── App.css       
│   │   ├── main.jsx      
│   │   ├── components/   
│   │   │   └── ...
│   │   └── index.css   
├── database/     
│   └── data/        
```

## 7\. Développement

  * **Hot-Reloading :** Grâce aux volumes Docker et à Nodemon (backend) / Vite (frontend), toute modification de votre code source sur votre machine hôte sera automatiquement détectée et rechargée dans les conteneurs, sans nécessiter de reconstruction manuelle.
  * **Logs :** Utilisez `docker-compose logs <nom_du_service>` (ex: `docker-compose logs backend`) pour voir les logs de vos conteneurs.
  * **Accès au shell du conteneur :** `docker exec -it <nom_du_conteneur> sh` (ex: `docker exec -it Togesong-backend sh`) pour déboguer à l'intérieur du conteneur.

## 8\. Prochaines Étapes

  * **Notifications** 
  * **Amélioration UI/UX**
  * **Fonctionnalités Sociales Avancées**
  * **Tests** 
  * **Déploiement** 

## 9\. Licence

Ce projet est sous licence MIT.