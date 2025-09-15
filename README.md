# Système de Gestion des Donations

Un système web complet pour la gestion des donations caritatives avec une architecture conteneurisée (Frontend, Backend, Base de données).

## 🏗️ Architecture

- **Frontend** : React.js avec design moderne (vert clair + gris)
- **Backend** : Node.js + Express + API REST
- **Base de données** : PostgreSQL
- **Conteneurisation** : Docker + Docker Compose

## 🚀 Démarrage rapide

### Prérequis
- Docker et Docker Compose installés
- Ports 3000, 3001, et 5432 disponibles

### Installation et lancement

1. **Cloner le projet**
```bash
git clone <repository-url>
cd donations-app
```

2. **Lancer tous les services**
```bash
docker-compose up --build
```

3. **Accéder à l'application**
- Frontend : http://localhost:3000
- Backend API : http://localhost:3001
- Base de données : localhost:5432

### Compte par défaut
- **Nom d'utilisateur** : `admin`
- **Mot de passe** : `admin123`

## 📋 Fonctionnalités

### 🔐 Authentification
- Connexion sécurisée avec JWT
- Gestion des sessions utilisateur

### 📊 Tableau de bord
- Résumé quotidien des donations
- Total global en Dinar Algérien (DA)
- Répartition par projet
- Liste des donations du jour

### ➕ Ajout de donations
- Formulaire simple et intuitif
- Sélection du projet concerné
- Enregistrement automatique de la date/heure

### 📅 Historique
- Consultation par jour
- Détails des donations par date
- Totaux journaliers

## 🛠️ Développement

### Structure du projet
```
donations-app/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/
│       ├── contexts/
│       └── App.js
└── README.md
```

### Variables d'environnement

#### Backend
- `DB_HOST` : Hôte de la base de données (défaut: database)
- `DB_PORT` : Port de la base de données (défaut: 5432)
- `DB_NAME` : Nom de la base de données (défaut: donations_db)
- `DB_USER` : Utilisateur de la base de données (défaut: donations_user)
- `DB_PASSWORD` : Mot de passe de la base de données (défaut: donations_password)
- `JWT_SECRET` : Clé secrète pour JWT (défaut: your_jwt_secret_key_here)

#### Frontend
- `REACT_APP_API_URL` : URL de l'API backend (défaut: http://localhost:3001/api)

### API Endpoints

#### Authentification
- `POST /api/login` - Connexion utilisateur

#### Dashboard
- `GET /api/dashboard` - Données du tableau de bord

#### Donations
- `POST /api/donations` - Ajouter une donation
- `GET /api/donations/history` - Historique des donations
- `GET /api/donations/date/:date` - Donations pour une date spécifique

#### Projets
- `GET /api/projects` - Liste des projets

#### Santé
- `GET /api/health` - Vérification de l'état de l'API

## 🎨 Design

Le design utilise une palette de couleurs agréable pour les yeux :
- **Vert clair** : `#4ade80` (couleur principale)
- **Gris** : `#f8fafc` à `#0f172a` (nuances de gris)
- Interface responsive et moderne

## 📊 Base de données

### Tables
- `users` - Utilisateurs du système
- `projects` - Projets caritatifs
- `donations` - Enregistrement des donations

### Projets par défaut
1. Aide aux familles démunies
2. Éducation des enfants
3. Soins médicaux
4. Urgences

## 🔧 Maintenance

### Logs
```bash
# Voir les logs de tous les services
docker-compose logs

# Logs d'un service spécifique
docker-compose logs frontend
docker-compose logs backend
docker-compose logs database
```

### Redémarrage
```bash
# Redémarrer tous les services
docker-compose restart

# Redémarrer un service spécifique
docker-compose restart frontend
```

### Arrêt
```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

## 🐛 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   - Vérifiez que les ports 3000, 3001, et 5432 sont libres
   - Modifiez les ports dans `docker-compose.yml` si nécessaire

2. **Erreur de connexion à la base de données**
   - Attendez que PostgreSQL soit complètement démarré
   - Vérifiez les variables d'environnement

3. **Problème de build**
   - Supprimez les images Docker : `docker-compose down --rmi all`
   - Rebuild : `docker-compose up --build`

## 📝 Licence

Ce projet est sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
