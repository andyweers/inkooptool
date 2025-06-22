# Deployment Guide - Lion Gris Order Tool

## Optie 1: Vercel (Aanbevolen - Gratis)

### Stap 1: Voorbereiding
1. Maak een account op [vercel.com](https://vercel.com)
2. Installeer Vercel CLI: `npm i -g vercel`

### Stap 2: Database Setup
Voor productie heb je een hosted database nodig. Opties:
- **PlanetScale** (gratis tier)
- **Railway** (gratis tier)
- **Supabase** (gratis tier)

### Stap 3: Environment Variables
Maak een `.env` bestand aan met:
```
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

### Stap 4: Deploy
```bash
# Login met Vercel
vercel login

# Deploy
vercel

# Voor productie
vercel --prod
```

### Stap 5: Database Migratie
Run de database migratie op je hosted database:
```bash
node server/database/update_schema.js
```

## Optie 2: Railway (Alternatief)

### Stap 1: Voorbereiding
1. Maak account op [railway.app](https://railway.app)
2. Verbind je GitHub repository

### Stap 2: Setup
1. Railway detecteert automatisch je Node.js app
2. Voeg environment variables toe
3. Railway zorgt voor database hosting

## Optie 3: Heroku (Betaald)

### Stap 1: Voorbereiding
1. Maak account op [heroku.com](https://heroku.com)
2. Installeer Heroku CLI

### Stap 2: Deploy
```bash
heroku create your-app-name
git push heroku main
```

## Database Migratie voor Productie

Voor alle opties moet je de database schema updaten:

```bash
# Update de DATABASE_URL in je environment
# Run de migratie
node server/database/update_schema.js
```

## Post-Deployment Checklist

- [ ] Database is gemigreerd
- [ ] Environment variables zijn ingesteld
- [ ] App is bereikbaar via URL
- [ ] Login werkt
- [ ] Orders kunnen worden toegevoegd/bewerkt
- [ ] Export/import functionaliteit werkt

## Troubleshooting

### Database Connectie Problemen
- Controleer DATABASE_URL
- Zorg dat database toegankelijk is vanaf je hosting provider

### CORS Errors
- Update CORS configuratie in `server/index.js`
- Voeg je domein toe aan de allowed origins

### Build Errors
- Controleer of alle dependencies in `package.json` staan
- Zorg dat build script correct is 