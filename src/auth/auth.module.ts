import { Module } from '@nestjs/common';
import { ApiTokenGuard } from './api-token.guard';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [ApiTokenGuard],
  exports: [ApiTokenGuard],
})
export class AuthModule {}
