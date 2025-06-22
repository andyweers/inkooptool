require('dotenv').config();
const { initPostgresDatabase } = require('./server/database/init-postgres');

async function main() {
  try {
    console.log('🚀 Initialiseren van Neon database...');
    
    // Check if environment variables are set
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      console.error('❌ Database environment variables zijn niet ingesteld!');
      console.log('📝 Zorg ervoor dat je .env bestand de volgende variabelen bevat:');
      console.log('   DB_HOST=ep-cool-forest-123456.us-east-2.aws.neon.tech');
      console.log('   DB_USER=default');
      console.log('   DB_PASSWORD=your_password_here');
      console.log('   DB_NAME=neondb');
      console.log('   DB_PORT=5432');
      return;
    }
    
    const pool = await initPostgresDatabase();
    console.log('✅ Neon database succesvol geïnitialiseerd!');
    console.log('🔑 Default login: admin / admin123');
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Fout bij initialiseren database:', error.message);
    process.exit(1);
  }
}

main(); 