require('dotenv').config();
const { initSupabaseDatabase } = require('./server/database/init-supabase');

async function main() {
  try {
    console.log('🚀 Initialiseren van Supabase database...');
    
    // Check if environment variables are set
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      console.error('❌ Database environment variables zijn niet ingesteld!');
      console.log('📝 Zorg ervoor dat je .env bestand de volgende variabelen bevat:');
      console.log('   DB_HOST=db.your-project-ref.supabase.co');
      console.log('   DB_USER=postgres');
      console.log('   DB_PASSWORD=your_password_here');
      console.log('   DB_NAME=postgres');
      console.log('   DB_PORT=5432');
      return;
    }
    
    const pool = await initSupabaseDatabase();
    console.log('✅ Supabase database succesvol geïnitialiseerd!');
    console.log('🔗 Database verbinding: OK');
    console.log('📊 Tabellen: orders, users');
    console.log('👤 Admin gebruiker: admin / admin123');
    
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Fout bij initialiseren Supabase database:', error.message);
    process.exit(1);
  }
}

main(); 