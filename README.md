# DealExpress API - TP API

TP API - Création d'une API REST complète inspirée de Dealabs permettant aux utilisateurs de partager des bons plans, de les voter et de les commenter, avec système de modération et gestion de rôles.

## Installation
### Prérequis
- Node.js
- MongoDB
- Postman/Insomnia

### Étapes d'installation
1. **Cloner le repository**
```bash
git clone https://github.com/LucasGYnov/TP_API_DealExpress.git
cd dealexpress
```

2. **Installer les dépendances**
```bash
npm install

npm install express mongoose jsonwebtoken bcryptjs dotenv cors express-validator
npm install -D nodemon
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
```
Editez le fichier `.env` avec vos configurations.


4. **Démarrer l'application**
```bash
npm run dev
```

## Endpoints de l'API
### Authentification
#### POST /api/auth/register
Inscription d'un nouvel utilisateur
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login
Connexion et génération du token JWT
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
Récupération du profil utilisateur (Authentification requise)

### Deals
#### GET /api/deals
Liste des deals approuvés avec pagination
```bash
GET /api/deals?page=1&limit=10
```

#### GET /api/deals/search
Recherche de deals
```bash
GET /api/deals/search?q=iphone
```

#### GET /api/deals/:id
Détails d'un deal spécifique

#### POST /api/deals
Création d'un nouveau deal (Authentification requise)
```json
{
  "title": "iPhone 15 à prix réduit",
  "description": "Super promotion sur le nouvel iPhone",
  "price": 899,
  "originalPrice": 999,
  "url": "https://example.com/deal",
  "category": "High-Tech"
}
```

#### PUT /api/deals/:id
Modification d'un deal (Ownership requis)
#### DELETE /api/deals/:id
Suppression d'un deal (Ownership ou Admin requis)

### Votes
#### POST /api/deals/:id/vote
Voter pour un deal (Authentification requise)
```json
{
  "type": "hot"
}
```

#### DELETE /api/deals/:id/vote
Retirer son vote (Authentification requise)

### Commentaires
#### GET /api/deals/:dealId/comments
Liste des commentaires d'un deal

#### POST /api/deals/:dealId/comments
Ajouter un commentaire (Authentification requise)
```json
{
  "content": "Super deal ! Merci pour le partage"
}
```

#### PUT /api/comments/:id
Modifier un commentaire (Ownership requis)
#### DELETE /api/comments/:id
Supprimer un commentaire (Ownership ou Admin requis)

### Administration
#### GET /api/admin/deals/pending
Liste des deals en attente (Moderator/Admin requis)

#### PATCH /api/admin/deals/:id/moderate
Modérer un deal (Moderator/Admin requis)
```json
{
  "status": "approved"
}
```

#### GET /api/admin/users
Liste des utilisateurs (Admin requis)
#### PATCH /api/admin/users/:id/role
Modifier le rôle d'un utilisateur (Admin requis)
```json
{
  "role": "moderator"
}
```

## Comptes de Test
### Utilisateur Standard
```json
{
  "email": "user@test.com",
  "password": "password123",
  "role": "user"
}
```

### Modérateur
```json
{
  "email": "moderator@test.com",
  "password": "password123",
  "role": "moderator"
}
```

### Administrateur
```json
{
  "email": "admin@test.com",
  "password": "password123",
  "role": "admin"
}
```

## Scénario de Démonstration
1. **Création d'un deal par un utilisateur**
   - Connexion avec le compte user
   - POST /api/deals pour créer un deal en statut "pending"
2. **Interaction communautaire**
   - Autres utilisateurs votent (hot/cold) sur le deal
   - Ajout de commentaires sur le deal
3. **Modération**
   - Connexion avec le compte moderator
   - GET /api/admin/deals/pending pour voir les deals en attente
   - PATCH /api/admin/deals/:id/moderate pour approuver le deal
4. **Gestion administrateur**
   - Connexion avec le compte admin
   - GET /api/admin/users pour voir tous les utilisateurs
   - PATCH /api/admin/users/:id/role pour promouvoir un user en moderator

(VIDEO/SCCREENSHOOTS A VENIR)

---

## Configuration Swagger (À venir)
La documentation Swagger sera disponible à l'endpoint `/api-docs` avec une description complète de tous les endpoints, modèles de données et exemples.

## Backup (Bonus)
Un script de backup automatique de la base MongoDB est prévu.