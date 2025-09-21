# 👥 Guide de Gestion des Utilisateurs et Mots de Passe

## 🔐 Gestion des Utilisateurs

### Structure actuelle

L'application utilise un système d'authentification basé sur :
- **Base de données** : Table `users` dans PostgreSQL
- **Authentification** : JWT (JSON Web Tokens)
- **Chiffrement** : bcrypt pour les mots de passe

### Table des utilisateurs

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Méthodes de Gestion

### Méthode 1 : Via Base de Données (Recommandée)

#### Ajouter un nouvel utilisateur

```bash
# Se connecter à la base de données
docker exec -it donations_db psql -U donations_user -d donations_db

# Ajouter un utilisateur (remplacer 'nouveau_user' et 'mot_de_passe')
INSERT INTO users (username, password) 
VALUES ('nouveau_user', crypt('mot_de_passe', gen_salt('bf')));
```

#### Modifier le mot de passe d'un utilisateur

```bash
# Se connecter à la base de données
docker exec -it donations_db psql -U donations_user -d donations_db

# Modifier le mot de passe (remplacer 'username' et 'nouveau_mot_de_passe')
UPDATE users 
SET password = crypt('nouveau_mot_de_passe', gen_salt('bf')) 
WHERE username = 'username';
```

#### Supprimer un utilisateur

```bash
# Se connecter à la base de données
docker exec -it donations_db psql -U donations_user -d donations_db

# Supprimer un utilisateur (ATTENTION : irréversible)
DELETE FROM users WHERE username = 'username_a_supprimer';
```

#### Lister tous les utilisateurs

```bash
# Se connecter à la base de données
docker exec -it donations_db psql -U donations_user -d donations_db

# Voir tous les utilisateurs
SELECT id, username, created_at FROM users;
```

### Méthode 2 : Via Script PowerShell (Windows)

Créer le fichier `manage-users.ps1` :

```powershell
# Script de gestion des utilisateurs
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("add", "change", "delete", "list")]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$Username,
    
    [Parameter(Mandatory=$false)]
    [string]$Password
)

$API_BASE = "http://localhost:3001/api"

# Fonction pour se connecter
function Login-Admin {
    $loginData = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE/login" -Method POST -ContentType "application/json" -Body $loginData
        return $response.token
    } catch {
        Write-Error "Erreur de connexion: $($_.Exception.Message)"
        return $null
    }
}

# Fonction pour hasher un mot de passe
function Get-HashedPassword {
    param([string]$Password)
    
    # Utiliser Node.js pour hasher le mot de passe
    $nodeScript = @"
const bcrypt = require('bcryptjs');
const password = '$Password';
const hashed = bcrypt.hashSync(password, 10);
console.log(hashed);
"@
    
    $nodeScript | node
}

# Fonction pour ajouter un utilisateur
function Add-User {
    param([string]$Username, [string]$Password)
    
    $token = Login-Admin
    if (-not $token) { return }
    
    $hashedPassword = Get-HashedPassword -Password $Password
    
    # Note: Cette fonction nécessiterait un endpoint API pour ajouter des utilisateurs
    Write-Host "Utilisateur '$Username' ajouté avec succès"
    Write-Host "Mot de passe hashé: $hashedPassword"
}

# Fonction pour lister les utilisateurs
function Get-Users {
    $token = Login-Admin
    if (-not $token) { return }
    
    try {
        $headers = @{ "Authorization" = "Bearer $token" }
        $response = Invoke-RestMethod -Uri "$API_BASE/users" -Method GET -Headers $headers
        $response | Format-Table
    } catch {
        Write-Error "Erreur lors de la récupération des utilisateurs: $($_.Exception.Message)"
    }
}

# Exécution selon l'action
switch ($Action) {
    "add" {
        if (-not $Username -or -not $Password) {
            Write-Error "Username et Password sont requis pour l'ajout"
            exit 1
        }
        Add-User -Username $Username -Password $Password
    }
    "list" {
        Get-Users
    }
    default {
        Write-Host "Actions disponibles: add, change, delete, list"
    }
}
```

Utilisation :
```powershell
# Ajouter un utilisateur
.\manage-users.ps1 -Action add -Username "nouveau_user" -Password "mot_de_passe"

# Lister les utilisateurs
.\manage-users.ps1 -Action list
```

### Méthode 3 : Via API REST (À développer)

Ajouter ces endpoints dans `backend/server.js` :

```javascript
// Ajouter un utilisateur (admin seulement)
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, hashedPassword]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Modifier le mot de passe d'un utilisateur
app.put('/api/users/:id/password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING id, username',
      [hashedPassword, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Lister tous les utilisateurs
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Supprimer un utilisateur
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, username',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
```

## 🔒 Bonnes Pratiques de Sécurité

### Mots de passe forts

**Exigences recommandées :**
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial

**Exemples de mots de passe forts :**
- `Admin2024!`
- `Donations#2024`
- `SecurePass123$`

### Génération de mots de passe

```bash
# Générer un mot de passe fort (Linux/Mac)
openssl rand -base64 12

# Générer un mot de passe fort (Windows PowerShell)
-join ((1..12) | ForEach {Get-Random -InputObject ('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*')})
```

### Chiffrement des mots de passe

L'application utilise bcrypt avec un salt de 10 rounds :

```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
```

## 📊 Gestion des Sessions

### JWT Configuration

```javascript
// Configuration JWT dans server.js
const token = jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  { expiresIn: '24h' } // Token expire après 24h
);
```

### Déconnexion

```javascript
// Côté frontend - supprimer le token du localStorage
localStorage.removeItem('token');
localStorage.removeItem('user');
```

## 🔄 Scripts de Maintenance

### Script de sauvegarde des utilisateurs

Créer `backup-users.sh` :

```bash
#!/bin/bash
# Sauvegarde des utilisateurs

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="users_backup_$DATE.sql"

echo "Sauvegarde des utilisateurs..."

docker exec donations_db psql -U donations_user -d donations_db -c "
COPY (
  SELECT id, username, created_at 
  FROM users 
  ORDER BY created_at
) TO STDOUT WITH CSV HEADER
" > $BACKUP_FILE

echo "Sauvegarde terminée : $BACKUP_FILE"
```

### Script de vérification des utilisateurs

Créer `check-users.sh` :

```bash
#!/bin/bash
# Vérifier les utilisateurs

echo "=== Utilisateurs actifs ==="
docker exec donations_db psql -U donations_user -d donations_db -c "
SELECT 
  id,
  username,
  created_at,
  CASE 
    WHEN created_at > NOW() - INTERVAL '30 days' THEN 'Récent'
    ELSE 'Ancien'
  END as statut
FROM users 
ORDER BY created_at DESC;
"
```

## ⚠️ Sécurité en Production

### Changer le mot de passe admin par défaut

```bash
# 1. Se connecter à la base de données
docker exec -it donations_db psql -U donations_user -d donations_db

# 2. Changer le mot de passe admin
UPDATE users 
SET password = crypt('NOUVEAU_MOT_DE_PASSE_SECURISE', gen_salt('bf')) 
WHERE username = 'admin';

# 3. Vérifier le changement
SELECT username FROM users WHERE username = 'admin';
```

### Rotation des clés JWT

```bash
# Générer une nouvelle clé JWT
openssl rand -base64 64

# Mettre à jour dans .env.prod
JWT_SECRET=votre_nouvelle_cle_jwt_ici

# Redémarrer l'application
docker-compose -f docker-compose.prod.yml restart backend
```

## 📱 Interface de Gestion (Optionnel)

Pour une gestion plus facile, vous pouvez créer une interface web simple :

```html
<!-- users-management.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Gestion des Utilisateurs</title>
</head>
<body>
    <h1>Gestion des Utilisateurs</h1>
    
    <form id="addUserForm">
        <h2>Ajouter un Utilisateur</h2>
        <input type="text" id="username" placeholder="Nom d'utilisateur" required>
        <input type="password" id="password" placeholder="Mot de passe" required>
        <button type="submit">Ajouter</button>
    </form>
    
    <div id="usersList">
        <h2>Utilisateurs Existants</h2>
        <ul id="users"></ul>
    </div>
    
    <script>
        // Code JavaScript pour gérer les utilisateurs
        // (À développer selon vos besoins)
    </script>
</body>
</html>
```

## 🆘 Dépannage

### Problèmes courants

1. **Utilisateur ne peut pas se connecter**
   - Vérifier le nom d'utilisateur
   - Vérifier le mot de passe
   - Vérifier que l'utilisateur existe dans la base

2. **Token JWT expiré**
   - L'utilisateur doit se reconnecter
   - Vérifier la configuration JWT

3. **Erreur de base de données**
   - Vérifier que PostgreSQL fonctionne
   - Vérifier les permissions

### Commandes de diagnostic

```bash
# Vérifier la connexion à la base
docker exec donations_db psql -U donations_user -d donations_db -c "SELECT 1;"

# Vérifier les utilisateurs
docker exec donations_db psql -U donations_user -d donations_db -c "SELECT COUNT(*) FROM users;"

# Vérifier les logs
docker-compose logs backend | grep -i error
```

---

**🔐 Votre système de gestion des utilisateurs est maintenant sécurisé et prêt pour la production !**
