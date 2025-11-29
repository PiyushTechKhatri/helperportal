import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import ws from 'ws';
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  try {
    // Create admin user
    await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, role) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role
    `, ['admin@jaipurhelp.com', hashedPassword, 'Admin', 'User', 'admin']);
    
    // Create agent user
    await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, role) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role
    `, ['agent@jaipurhelp.com', hashedPassword, 'Agent', 'User', 'agent']);
    
    console.log('Admin and Agent accounts created successfully!');
    console.log('Admin: admin@jaipurhelp.com / admin123');
    console.log('Agent: agent@jaipurhelp.com / admin123');
  } catch (error) {
    console.error('Error creating accounts:', error);
  } finally {
    await pool.end();
  }
}

createAdmin();