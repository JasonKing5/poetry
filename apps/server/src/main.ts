import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import { RolesPermissionsGuard } from './common/guards/roles-permissions.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', // 或使用正则 /动态方式
    credentials: true,               // 允许携带 cookie
  });

  app.setGlobalPrefix('api');

  app.use(cookieParser());

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new RolesPermissionsGuard(reflector, new JwtService()));
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
