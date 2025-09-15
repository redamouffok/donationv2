# 🎉 Système de Gestion des Donations - Guide d'utilisation

## ✅ Installation terminée avec succès !

Votre système de gestion des donations est maintenant opérationnel. Voici comment l'utiliser :

## 🚀 Accès à l'application

**URL de l'application :** http://localhost:3000

**Compte administrateur :**
- **Nom d'utilisateur :** `admin`
- **Mot de passe :** `admin123`

## 📋 Fonctionnalités disponibles

### 1. 🔐 Connexion
- Ouvrez http://localhost:3000 dans votre navigateur
- Utilisez les identifiants `admin` / `admin123`
- Vous serez redirigé vers le tableau de bord

### 2. 📊 Tableau de bord
- **Résumé quotidien** : Total des donations du jour en Dinar Algérien (DA)
- **Statistiques** : Nombre de donations et projets actifs
- **Donations par projet** : Répartition des montants par projet
- **Dernières donations** : Liste des donations récentes avec heure

### 3. ➕ Ajouter une donation
- Cliquez sur "Ajouter donation" dans le menu
- Remplissez le formulaire :
  - Nom du donateur
  - Projet concerné (4 projets pré-configurés)
  - Montant en DA
- La date et l'heure sont ajoutées automatiquement

### 4. 📅 Historique
- Consultez l'historique par jour
- Cliquez sur une date pour voir les détails
- Totaux journaliers disponibles

## 🎨 Design

L'interface utilise une palette de couleurs agréable pour les yeux :
- **Vert clair** (#4ade80) pour les éléments principaux
- **Gris** (#f8fafc à #0f172a) pour les textes et arrière-plans
- Design responsive qui s'adapte à tous les écrans

## 🛠️ Gestion du système

### Démarrer l'application
```bash
docker-compose up -d
```

### Arrêter l'application
```bash
docker-compose down
```

### Voir les logs
```bash
# Tous les services
docker-compose logs

# Service spécifique
docker-compose logs frontend
docker-compose logs backend
docker-compose logs database
```

### Redémarrer un service
```bash
docker-compose restart frontend
docker-compose restart backend
docker-compose restart database
```

## 📊 Projets pré-configurés

1. **Aide aux familles démunies** - Soutien financier pour les familles en difficulté
2. **Éducation des enfants** - Financement de la scolarité et du matériel éducatif
3. **Soins médicaux** - Aide pour les soins de santé des plus démunis
4. **Urgences** - Fonds d'urgence pour les situations critiques

## 🔧 API Backend

L'API backend est accessible sur http://localhost:3001/api

**Endpoints principaux :**
- `POST /api/login` - Connexion
- `GET /api/dashboard` - Données du tableau de bord
- `POST /api/donations` - Ajouter une donation
- `GET /api/donations/history` - Historique
- `GET /api/projects` - Liste des projets

## 🗄️ Base de données

- **Type :** PostgreSQL
- **Port :** 5432
- **Base :** donations_db
- **Utilisateur :** donations_user
- **Mot de passe :** donations_password

## 🐛 Dépannage

### Problème de connexion
1. Vérifiez que tous les conteneurs sont en cours d'exécution :
   ```bash
   docker-compose ps
   ```

2. Redémarrez les services :
   ```bash
   docker-compose restart
   ```

### Problème de ports
Si les ports 3000, 3001, ou 5432 sont occupés, modifiez le fichier `docker-compose.yml`

### Problème de base de données
```bash
# Supprimer et recréer la base de données
docker-compose down -v
docker-compose up --build
```

## 📈 Test de l'API

Un script de test est disponible : `test-api.ps1`
```bash
.\test-api.ps1
```

## 🎯 Prochaines étapes

1. **Personnalisation** : Modifiez les projets selon vos besoins
2. **Sécurité** : Changez le mot de passe par défaut
3. **Sauvegarde** : Configurez des sauvegardes régulières de la base de données
4. **Monitoring** : Ajoutez des outils de monitoring si nécessaire

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `docker-compose logs`
2. Consultez le README.md pour plus de détails techniques
3. Redémarrez l'application : `docker-compose restart`

---

**🎉 Félicitations ! Votre système de gestion des donations est prêt à être utilisé !**
