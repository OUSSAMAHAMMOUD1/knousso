# KnOusso — E-Commerce de Chaussures de Luxe

## Structure du Projet

```
brand/
├── frontend/          ← React + Tailwind CSS
│   ├── src/
│   │   ├── components/   ← Navbar, Footer, ProductCard, LoadingSpinner
│   │   ├── context/      ← CartContext, AuthContext (state global)
│   │   ├── pages/        ← Home, Catalogue, ProductDetail, Cart, Contact, Login, Admin
│   │   ├── utils/        ← api.js (axios client)
│   │   └── i18n.js       ← Traductions FR/AR/EN
│   └── package.json
└── backend/           ← Node.js + Express + MongoDB
    ├── src/
    │   ├── config/       ← db.js (connexion MongoDB)
    │   ├── models/       ← User, Product, Order
    │   ├── routes/       ← auth.js, products.js, orders.js
    │   ├── middleware/   ← auth.js (JWT protect + adminOnly)
    │   ├── server.js     ← Point d'entrée
    │   └── seed.js       ← Données de test
    └── package.json
```

## Lancement en local

### Backend

```bash
cd backend
cp .env.example .env      # Remplir MONGODB_URI, JWT_SECRET
npm install
npm run seed              # Insérer les données de test
npm run dev               # Démarrer sur http://localhost:5000
```

### Frontend

```bash
cd frontend
cp .env.example .env      # REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start                 # Démarrer sur http://localhost:3000
```

## Compte Admin (après seed)

- Email: `admin@knousso.ma`
- Password: `admin123456`

## API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| GET | /api/auth/me | Profil (JWT) |
| GET | /api/products | Liste produits (filtres: search, category, size, minPrice, maxPrice, sort) |
| GET | /api/products/:id | Détail produit |
| POST | /api/products | Créer (admin) |
| PUT | /api/products/:id | Modifier (admin) |
| DELETE | /api/products/:id | Supprimer (admin) |
| POST | /api/orders | Créer commande (JWT) |
| GET | /api/orders/my | Mes commandes (JWT) |
| GET | /api/orders | Toutes les commandes (admin) |
| PATCH | /api/orders/:id/status | Changer statut (admin) |

## Déploiement

### Frontend → Vercel
1. Push `frontend/` sur GitHub
2. Importer sur [vercel.com](https://vercel.com)
3. Ajouter variable d'env: `REACT_APP_API_URL=https://your-api.onrender.com/api`

### Backend → Render
1. Push `backend/` sur GitHub
2. Créer Web Service sur [render.com](https://render.com)
3. Ajouter variables: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`

### Database → MongoDB Atlas
1. Créer cluster sur [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Créer utilisateur DB
3. Copier l'URI dans `MONGODB_URI`

## Features

- 🛒 Panier persistant (localStorage)
- 🔐 Auth JWT (login/register)
- 👑 Dashboard admin (CRUD produits, suivi commandes)
- 🌍 Multilingue FR / AR / EN
- 📱 100% Responsive (mobile + desktop)
- 🔍 Recherche + filtres (taille, prix, catégorie)
- ✨ Design luxury (noir + or)
