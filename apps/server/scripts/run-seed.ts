import { execSync } from 'child_process';

async function runSeed() {
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (nodeEnv === 'development') {
    console.log('🌱 [run-seed] Development environment detected. Running seed script...');
    try {
      execSync('ts-node ./prisma/seed.ts', { stdio: 'inherit' });
      console.log('✅ [run-seed] Seeding completed.');
    } catch (error) {
      console.error('❌ [run-seed] Seeding failed:', error);
      process.exit(1);
    }
  } else {
    console.log(`🚫 [run-seed] Skipping seed. Current NODE_ENV: ${nodeEnv}`);
  }
}

runSeed();