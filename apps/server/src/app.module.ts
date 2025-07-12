import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PoetryModule } from './poem/poem.module';
import { PoetryPropModule } from './poetry-prop/poetry-prop.module';
import { MailModule } from './mail/mail.module';
import { AuthorModule } from './author/author.module';
import { LikeModule } from './like/like.module';
import { CollectionModule } from './collection/collection.module';
import { AuthMiddleware } from './common/middlewares/auth.middleware';
import { AuthGuard } from './common/guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    UserModule, AuthModule, PoetryModule, PoetryPropModule, MailModule, AuthorModule, LikeModule, CollectionModule],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}
