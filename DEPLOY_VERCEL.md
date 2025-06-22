# Vercel Deployment Guide

## Stap 1: Database Setup

Voor Vercel heb je een externe database nodig. Aanbevolen opties:

### Optie A: PlanetScale (Gratis tier)
1. Ga naar [planetscale.com](https://planetscale.com)
2. Maak een gratis account aan
3. Maak een nieuwe database aan
4. Kopieer de connection string

### Optie B: Railway (Gratis tier)
1. Ga naar [railway.app](https://railway.app)
2. Maak een gratis account aan
3. Maak een nieuwe MySQL database aan
4. Kopieer de connection string

### Optie C: Supabase (Gratis tier)
1. Ga naar [supabase.com](https://supabase.com)
2. Maak een gratis account aan
3. Maak een nieuwe PostgreSQL database aan
4. Pas de database configuratie aan voor PostgreSQL

## Stap 2: Vercel Account

1. Ga naar [vercel.com](https://vercel.com)
2. Maak een gratis account aan
3. Verbind je GitHub account

## Stap 3: Code Uploaden naar GitHub

1. Maak een nieuwe repository aan op GitHub
2. Upload alle code naar de repository
3. Zorg ervoor dat de volgende bestanden aanwezig zijn:
   - `vercel.json`
   - `server/package.json`
   - `client/package.json`

## Stap 4: Environment Variables Instellen

In je Vercel dashboard, ga naar je project en stel de volgende environment variables in:

```
DB_HOST=your-database-host
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

## Stap 5: Deployen

1. Ga naar je Vercel dashboard
2. Klik op "New Project"
3. Importeer je GitHub repository
4. Vercel detecteert automatisch de configuratie uit `vercel.json`
5. Klik op "Deploy"

## Stap 6: Database Initialisatie

Na de eerste deployment:

1. Ga naar je Vercel dashboard
2. Open de "Functions" tab
3. Zoek naar een API route die de database initialiseert
4. Of maak een tijdelijke route aan om de database te initialiseren

## Stap 7: Testen

1. Ga naar je Vercel URL (bijv. `https://your-app.vercel.app`)
2. Log in met de standaard credentials:
   - Username: `admin`
   - Password: `admin123`
3. Test alle functionaliteiten

## Troubleshooting

### Database Connection Issues
- Controleer of alle environment variables correct zijn ingesteld
- Zorg ervoor dat je database publiek toegankelijk is
- Controleer firewall instellingen

### Build Errors
- Controleer of alle dependencies correct zijn geïnstalleerd
- Zorg ervoor dat Node.js versie compatibel is (gebruik Node.js 18+)

### CORS Issues
- Controleer of de CORS configuratie correct is in `server/index.js`
- Zorg ervoor dat de juiste origins zijn toegestaan

## Database Schema

De applicatie maakt automatisch de volgende tabellen aan:

### Orders Table
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier VARCHAR(255) NOT NULL,
  order_number VARCHAR(255) NULL,
  webshop VARCHAR(255) NULL,
  description TEXT NULL,
  total_amount_excl_vat DECIMAL(10,2) NULL,
  total_vat DECIMAL(10,2) NULL,
  shipping_costs DECIMAL(10,2) NULL,
  is_return TINYINT(1) DEFAULT 0,
  quote_requested TINYINT(1) DEFAULT 0,
  date_quote_requested DATE NULL,
  quote_received TINYINT(1) DEFAULT 0,
  date_quote_received DATE NULL,
  order_placed TINYINT(1) DEFAULT 0,
  date_order_placed DATE NULL,
  order_received TINYINT(1) DEFAULT 0,
  date_order_received DATE NULL,
  invoice_received TINYINT(1) DEFAULT 0,
  date_invoice_received DATE NULL,
  invoice_paid TINYINT(1) DEFAULT 0,
  date_invoice_paid DATE NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Support

Voor vragen of problemen:
1. Controleer de Vercel logs in je dashboard
2. Controleer de database logs
3. Test lokaal eerst voordat je deployt 