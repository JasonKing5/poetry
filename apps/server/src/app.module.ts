import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PoetryModule } from './poetry/poetry.module';
import { PoetryPropModule } from './poetry-prop/poetry-prop.module';
import { MailModule } from './mail/mail.module';
import { AuthorModule } from './author/author.module';
import { LikeModule } from './like/like.module';

@Module({
  imports: [UserModule, AuthModule, PoetryModule, PoetryPropModule, MailModule, AuthorModule, LikeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
