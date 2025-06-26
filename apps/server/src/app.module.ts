import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PoetryModule } from './poetry/poetry.module';
import { PoetryPropModule } from './poetry-prop/poetry-prop.module';
import { MailModule } from './mail/mail.module';
import { AuthorModule } from './author/author.module';
import { LikeModule } from './like/like.module';
import { PoetryListModule } from './poetry-list/poetry-list.module';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    UserModule, AuthModule, PoetryModule, PoetryPropModule, MailModule, AuthorModule, LikeModule, PoetryListModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}
