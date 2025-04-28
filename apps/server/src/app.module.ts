import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PoetryModule } from './poetry/poetry.module';

@Module({
  imports: [UserModule, AuthModule, PoetryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
