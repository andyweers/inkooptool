#!/bin/bash

echo "🚀 Lion Gris Order Tool - Deployment Script"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    cat > .env << EOF
# Database Configuration
DATABASE_TYPE=sqlite
DATABASE_URL=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this

# Environment
NODE_ENV=development
EOF
    echo "✅ .env template created. Please update with your values."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..

# Build client
echo "🔨 Building client..."
cd client && npm run build && cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up a hosted database (PlanetScale, Railway, or Supabase)"
echo "2. Update DATABASE_URL in your Vercel environment variables"
echo "3. Run database migration: node server/database/update_schema.js"
echo "4. Test your application"
echo ""
echo "🌐 Your app will be available at: https://your-app-name.vercel.app" 