require('dotenv').config();
const { initMySQLDatabase } = require('./server/database/init-mysql');

async function main() {
  try {
    console.log('🚀 Initialiseren van PlanetScale database...');
    
    // Check if environment variables are set
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
      console.error('❌ Database environment variables zijn niet ingesteld!');
      console.log('📝 Zorg ervoor dat je .env bestand de volgende variabelen bevat:');
      console.log('   DB_HOST=aws.connect.psdb.cloud');
      console.log('   DB_USER=your_username_here');
      console.log('   DB_PASSWORD=your_password_here');
      console.log('   DB_NAME=your_database_name_here');
      return;
    }
    
    const pool = await initMySQLDatabase();
    console.log('✅ PlanetScale database succesvol geïnitialiseerd!');
    console.log('🔗 Database verbinding: OK');
    console.log('📊 Tabellen: aangemaakt/gecontroleerd');
    console.log('👤 Default gebruiker: admin/admin123');
    
    // Test connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('🏓 Database ping: OK');
    
    console.log('\n🎉 Klaar! Je kunt nu je app deployen naar Vercel.');
    console.log('📋 Volgende stappen:');
    console.log('   1. Commit je wijzigingen naar GitHub');
    console.log('   2. Deploy naar Vercel');
    console.log('   3. Voeg je environment variables toe in Vercel dashboard');
    
  } catch (error) {
    console.error('❌ Fout bij initialiseren database:', error.message);
    console.log('\n🔧 Mogelijke oplossingen:');
    console.log('   - Controleer je PlanetScale credentials in .env');
    console.log('   - Zorg ervoor dat je database bestaat in PlanetScale');
    console.log('   - Controleer je internetverbinding');
  }
}

main(); 