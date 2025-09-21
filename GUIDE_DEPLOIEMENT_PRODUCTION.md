# 🚀 Guide de Déploiement en Production

## 📋 Prérequis

### Serveur VM requis
- **OS** : Ubuntu 20.04 LTS ou CentOS 8+ (recommandé)
- **RAM** : Minimum 4GB (8GB recommandé)
- **CPU** : 2 cœurs minimum
- **Stockage** : 20GB minimum
- **Réseau** : Accès internet + port 80/443 ouverts

### Logiciels nécessaires
- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Git
- Nginx (pour reverse proxy)
- Certbot (pour SSL)

## 🔧 Installation sur la VM

### Étape 1 : Préparation du serveur

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation des dépendances
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installation de Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Redémarrer la session
exit
# Se reconnecter à la VM
```

### Étape 2 : Cloner le projet

```bash
# Créer un répertoire pour l'application
sudo mkdir -p /opt/donations-app
sudo chown $USER:$USER /opt/donations-app
cd /opt/donations-app

# Cloner le projet (remplacer par votre repo)
git clone https://github.com/votre-username/donations-app.git .
# OU télécharger et extraire l'archive
```

### Étape 3 : Configuration de production

Créer le fichier `docker-compose.prod.yml` :

```yaml
version: '3.8'

services:
  database:
    image: postgres:15
    container_name: donations_db_prod
    environment:
      POSTGRES_DB: donations_db
      POSTGRES_USER: donations_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - donations_network
    restart: unless-stopped

  backend:
    build: ./backend
    container_name: donations_backend_prod
    environment:
      NODE_ENV: production
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: donations_db
      DB_USER: donations_user
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - database
    networks:
      - donations_network
    restart: unless-stopped

  frontend:
    build: 
      context: ./frontend
      args:
        - REACT_APP_API_URL=https://votre-domaine.com/api
    container_name: donations_frontend_prod
    depends_on:
      - backend
    networks:
      - donations_network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: donations_nginx_prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - donations_network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  donations_network:
    driver: bridge
```

### Étape 4 : Configuration Nginx

Créer le fichier `nginx.conf` :

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }
    
    upstream backend {
        server backend:3001;
    }

    server {
        listen 80;
        server_name votre-domaine.com www.votre-domaine.com;
        
        # Redirection vers HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name votre-domaine.com www.votre-domaine.com;

        # Configuration SSL
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Étape 5 : Variables d'environnement

Créer le fichier `.env.prod` :

```bash
# Base de données
DB_PASSWORD=votre_mot_de_passe_securise_ici

# JWT Secret (générer une clé forte)
JWT_SECRET=votre_jwt_secret_tres_long_et_securise_ici

# Domaine
DOMAIN=votre-domaine.com
```

### Étape 6 : Script de déploiement

Créer le fichier `deploy.sh` :

```bash
#!/bin/bash

# Charger les variables d'environnement
source .env.prod

# Arrêter les conteneurs existants
docker-compose -f docker-compose.prod.yml down

# Construire et démarrer les nouveaux conteneurs
docker-compose -f docker-compose.prod.yml up --build -d

# Attendre que les services soient prêts
sleep 30

# Vérifier le statut
docker-compose -f docker-compose.prod.yml ps

echo "Déploiement terminé !"
echo "Application accessible sur : https://votre-domaine.com"
```

Rendre le script exécutable :
```bash
chmod +x deploy.sh
```

## 🔐 Configuration SSL avec Let's Encrypt

### Étape 1 : Obtenir le certificat SSL

```bash
# Arrêter temporairement Nginx
docker-compose -f docker-compose.prod.yml stop nginx

# Obtenir le certificat
sudo certbot certonly --standalone -d votre-domaine.com -d www.votre-domaine.com

# Copier les certificats
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*

# Redémarrer Nginx
docker-compose -f docker-compose.prod.yml up -d nginx
```

### Étape 2 : Renouvellement automatique

Créer un cron job :
```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour renouveler automatiquement
0 2 * * * /usr/bin/certbot renew --quiet && docker-compose -f /opt/donations-app/docker-compose.prod.yml restart nginx
```

## 🚀 Déploiement

### Déploiement initial

```bash
# 1. Configurer le domaine
# Modifier nginx.conf avec votre domaine
# Modifier .env.prod avec vos mots de passe

# 2. Lancer le déploiement
./deploy.sh

# 3. Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Mise à jour de l'application

```bash
# 1. Récupérer les dernières modifications
git pull origin main

# 2. Redéployer
./deploy.sh
```

## 📊 Monitoring et maintenance

### Commandes utiles

```bash
# Voir le statut des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart backend

# Sauvegarder la base de données
docker exec donations_db_prod pg_dump -U donations_user donations_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurer la base de données
docker exec -i donations_db_prod psql -U donations_user donations_db < backup_file.sql
```

### Surveillance des ressources

```bash
# Utilisation des ressources
docker stats

# Espace disque
df -h

# Mémoire
free -h
```

## 🔒 Sécurité

### Firewall

```bash
# Configurer UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3000
sudo ufw deny 3001
sudo ufw deny 5432
```

### Mots de passe sécurisés

```bash
# Générer un mot de passe fort pour la DB
openssl rand -base64 32

# Générer un JWT secret fort
openssl rand -base64 64
```

## 📱 Accès à l'application

- **URL** : https://votre-domaine.com
- **Compte admin** : admin / admin123 (à changer en production)

## ⚠️ Points importants

1. **Changer les mots de passe par défaut** avant le déploiement
2. **Configurer un domaine** valide
3. **Sauvegarder régulièrement** la base de données
4. **Surveiller les logs** pour détecter les problèmes
5. **Mettre à jour** régulièrement les images Docker

## 🆘 Dépannage

### Problèmes courants

1. **Port 80/443 occupé** : Vérifier qu'aucun autre service n'utilise ces ports
2. **Certificat SSL** : Vérifier que le domaine pointe vers votre serveur
3. **Base de données** : Vérifier les logs de la base de données
4. **Permissions** : Vérifier les permissions des fichiers

### Logs de débogage

```bash
# Logs détaillés
docker-compose -f docker-compose.prod.yml logs --tail=100

# Logs d'un service spécifique
docker-compose -f docker-compose.prod.yml logs backend
```

---

**🎉 Votre application est maintenant déployée en production !**
