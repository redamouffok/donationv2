# 📝 Guide de Modification des Projets

## 🎯 Comment modifier la liste des projets

### Méthode 1 : Modification directe dans le code (Recommandée)

1. **Ouvrir le fichier backend**
   ```
   backend/server.js
   ```

2. **Localiser la section des projets par défaut** (lignes 70-79)
   ```javascript
   await pool.query(`
     INSERT INTO projects (name, description) VALUES 
     ('بشرى الصابرين', 'دعم معنوي وروحي للمرضى والمحتاجين'),
     ('سقياء الماء', 'توفير المياه النظيفة للمناطق المحتاجة'),
     ('كفالة الايتام', 'رعاية شاملة للأيتام وتوفير احتياجاتهم'),
     ('وجبات غذائية', 'توزيع الوجبات الغذائية على الفقراء والمحتاجين'),
     ('عقائق', 'بناء المساجد والمؤسسات الدينية'),
     ('حفر الأبار', 'حفر الآبار لتوفير المياه في المناطق النائية'),
     ('أخرى', 'مشاريع خيرية أخرى متنوعة')
   `);
   ```

3. **Modifier les projets selon vos besoins**
   - Changer les noms des projets
   - Modifier les descriptions
   - Ajouter ou supprimer des projets

4. **Redémarrer l'application**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

### Méthode 2 : Modification via base de données (Avancée)

1. **Se connecter à la base de données PostgreSQL**
   ```bash
   docker exec -it donations_db psql -U donations_user -d donations_db
   ```

2. **Voir les projets actuels**
   ```sql
   SELECT * FROM projects;
   ```

3. **Modifier un projet existant**
   ```sql
   UPDATE projects 
   SET name = 'Nouveau nom', description = 'Nouvelle description' 
   WHERE id = 1;
   ```

4. **Ajouter un nouveau projet**
   ```sql
   INSERT INTO projects (name, description) 
   VALUES ('Nom du projet', 'Description du projet');
   ```

5. **Supprimer un projet**
   ```sql
   DELETE FROM projects WHERE id = 1;
   ```

## 📋 Projets actuels

| ID | Nom (Arabe) | Description (Arabe) | Description (Français) |
|----|-------------|-------------------|----------------------|
| 1 | بشرى الصابرين | دعم معنوي وروحي للمرضى والمحتاجين | Soutien moral et spirituel aux malades et nécessiteux |
| 2 | سقياء الماء | توفير المياه النظيفة للمناطق المحتاجة | Fourniture d'eau potable aux zones nécessiteuses |
| 3 | كفالة الايتام | رعاية شاملة للأيتام وتوفير احتياجاتهم | Parrainage complet des orphelins et fourniture de leurs besoins |
| 4 | وجبات غذائية | توزيع الوجبات الغذائية على الفقراء والمحتاجين | Distribution de repas aux pauvres et nécessiteux |
| 5 | عقائق | بناء المساجد والمؤسسات الدينية | Construction de mosquées et d'institutions religieuses |
| 6 | حفر الأبار | حفر الآبار لتوفير المياه في المناطق النائية | Forage de puits pour fournir de l'eau dans les zones reculées |
| 7 | أخرى | مشاريع خيرية أخرى متنوعة | Autres projets caritatifs divers |

## ⚠️ Important à savoir

### Avant de modifier
- **Sauvegardez** la base de données avant toute modification
- Les projets existants avec des donations ne peuvent pas être supprimés facilement
- Testez les modifications sur un environnement de développement

### Bonnes pratiques
1. **Noms courts** : Gardez les noms de projets courts pour l'affichage
2. **Descriptions claires** : Descriptions explicites en arabe
3. **Ordre logique** : Organisez les projets par priorité
4. **Cohérence** : Maintenez un style cohérent dans les noms

### Exemple de modification

**Avant :**
```javascript
('وجبات غذائية', 'توزيع الوجبات الغذائية على الفقراء والمحتاجين')
```

**Après :**
```javascript
('وجبات ساخنة', 'توزيع الوجبات الساخنة يومياً للمحتاجين في الشتاء')
```

## 🔄 Redémarrage nécessaire

Après toute modification, redémarrez l'application :

```bash
# Arrêter l'application
docker-compose down

# Redémarrer avec les nouvelles modifications
docker-compose up --build
```

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez la syntaxe SQL
2. Assurez-vous que les guillemets sont corrects
3. Redémarrez complètement l'application
4. Consultez les logs : `docker-compose logs backend`
