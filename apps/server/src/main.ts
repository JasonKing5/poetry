import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { RolesPermissionsGuard } from './common/guards/roles-permissions.guard';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const prisma = new PrismaClient();
  execSync('ts-node ./prisma/seed.ts');

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesPermissionsGuard(reflector, new JwtService()));

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
