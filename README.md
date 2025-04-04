# IBACY - Gestion Académique

Application de gestion académique pour l'Institut Biblique de l'Alliance Chrétienne de Yamoussoukro.

## Technologies utilisées

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase

## Configuration requise

- Node.js 18+
- npm 9+

## Installation

1. Clonez le dépôt :
```bash
git clone <votre-repo-url>
cd ibacy-gestion-academique
```

2. Installez les dépendances :
```bash
npm install
```

3. Copiez le fichier `.env.example` en `.env` et configurez vos variables d'environnement :
```bash
cp .env.example .env
```

4. Remplissez les variables d'environnement dans le fichier `.env` :
```
VITE_SUPABASE_URL=votre-url-supabase
VITE_SUPABASE_ANON_KEY=votre-cle-anon-supabase
```

## Développement

Pour lancer l'application en mode développement :

```bash
npm run dev
```

## Production

Pour construire l'application pour la production :

```bash
npm run build
```

## Déploiement

L'application est configurée pour être déployée sur Vercel. Pour déployer :

1. Connectez votre dépôt GitHub à Vercel
2. Configurez les variables d'environnement dans les paramètres du projet Vercel :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Déployez !

## Structure du projet

```
├── src/
│   ├── components/     # Composants React
│   ├── hooks/         # Hooks personnalisés
│   ├── lib/           # Utilitaires et configurations
│   ├── types/         # Types TypeScript
│   └── App.tsx        # Composant racine
├── public/            # Fichiers statiques
├── .env.example       # Example de variables d'environnement
├── vercel.json        # Configuration Vercel
└── vite.config.ts     # Configuration Vite
```