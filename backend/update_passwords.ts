import { prisma } from './src/config/prisma';
import * as argon2 from 'argon2';

async function updatePasswords() {
  try {
    console.log('Updating all user passwords...');
    const newHash = await argon2.hash('123456');
    
    const result = await prisma.user.updateMany({
      data: { passwordHash: newHash }
    });
    
    console.log(`✅ Successfully updated passwords for ${result.count} users to "123456".`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update passwords:', err);
    process.exit(1);
  }
}

updatePasswords();
